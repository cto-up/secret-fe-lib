<template>
  <div class="space-y-3">
    <Label>{{ label }}</Label>

    <!-- Existing secrets list -->
    <div v-if="!creating" class="space-y-2">
      <div
        v-for="s in secrets"
        :key="s.name"
        :class="[
          'flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors',
          modelValue === s.name
            ? 'border-primary bg-primary/5'
            : 'hover:bg-muted/40',
        ]"
        @click="selectExisting(s.name)"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'h-4 w-4 rounded-full border-2',
              modelValue === s.name
                ? 'border-primary bg-primary'
                : 'border-muted-foreground',
            ]"
          />
          <div>
            <p class="text-sm font-medium">
              {{ s.name }}
            </p>
            <p v-if="s.description" class="text-xs text-muted-foreground">
              {{ s.description }}
            </p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-muted-foreground">
            {{ s.status }}
          </div>
          <div
            v-if="usageCount(s.name) > 0"
            class="text-[10px] text-muted-foreground mt-0.5"
          >
            {{
              t(
                usageCount(s.name) === 1
                  ? "secret.picker.usedBy"
                  : "secret.picker.usedByPlural",
                { count: usageCount(s.name) }
              )
            }}
          </div>
        </div>
      </div>

      <div
        v-if="loading"
        class="text-center py-2 text-sm text-muted-foreground"
      >
        {{ t("secret.picker.loading") }}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        class="w-full"
        @click="enterCreateMode"
      >
        <Plus class="h-4 w-4 mr-2" /> {{ t("secret.picker.createCta") }}
      </Button>
    </div>

    <!-- One-time reveal panel (server-generated secret). Shown once after
         the generate path returns plaintext; the value is never recoverable
         after the user dismisses this panel. -->
    <div
      v-else-if="revealed"
      class="rounded-md border border-warning/40 p-4 space-y-3 bg-warning/5"
    >
      <div class="flex items-start gap-2">
        <KeyRound class="h-4 w-4 mt-0.5 text-warning shrink-0" />
        <div>
          <p class="text-sm font-medium">
            {{ t("secret.picker.revealTitle") }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t("secret.picker.revealBody") }}
          </p>
        </div>
      </div>

      <div class="space-y-1">
        <Label class="text-xs">{{ t("secret.picker.revealValueLabel") }}</Label>
        <div class="flex gap-2">
          <Input
            :model-value="revealed.value"
            readonly
            class="font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            :title="t('secret.picker.copy')"
            @click="copyRevealed"
          >
            <Check v-if="copied" class="h-3.5 w-3.5" />
            <Copy v-else class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div class="flex justify-end">
        <Button type="button" size="sm" @click="dismissReveal">
          {{ t("secret.picker.revealDismiss") }}
        </Button>
      </div>
    </div>

    <!-- Inline create form -->
    <div v-else class="rounded-md border p-4 space-y-3 bg-muted/20">
      <div class="space-y-1">
        <Label for="new-secret-name">
          {{ t("secret.picker.nameLabel") }}
          <span class="text-destructive">*</span>
        </Label>
        <Input
          id="new-secret-name"
          v-model="newSecret.name"
          :placeholder="`e.g. ${connectorType}-prod`"
        />
      </div>
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <Label for="new-secret-value">
            {{ valueLabel }} <span class="text-destructive">*</span>
          </Label>
          <button
            type="button"
            class="text-xs text-primary hover:underline disabled:opacity-50"
            :disabled="saving"
            @click="generate"
          >
            {{ t("secret.picker.generateCta") }}
          </button>
        </div>
        <Input
          id="new-secret-value"
          v-model="newSecret.value"
          type="password"
          :placeholder="valuePlaceholder"
        />
        <p class="text-xs text-muted-foreground">
          {{ t("secret.picker.generateHint") }}
        </p>
        <p v-if="docsUrl" class="text-xs text-muted-foreground">
          {{ t("secret.picker.docsHint") }}
          <a
            :href="docsUrl"
            target="_blank"
            rel="noopener"
            class="underline text-primary"
          >
            {{ t("secret.picker.docsLink", { label: valueLabel }) }}
          </a>
        </p>
      </div>
      <div class="space-y-1">
        <Label for="new-secret-desc">
          {{ t("secret.picker.descriptionLabel") }}
        </Label>
        <Input id="new-secret-desc" v-model="newSecret.description" />
      </div>

      <div v-if="createError" class="text-sm text-destructive">
        {{ createError }}
      </div>

      <div class="flex gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          :disabled="saving"
          @click="cancelCreate"
        >
          {{ t("secret.picker.cancel") }}
        </Button>
        <Button
          type="button"
          size="sm"
          :disabled="!canCreate || saving"
          @click="save"
        >
          <Loader2 v-if="saving" class="h-3 w-3 mr-2 animate-spin" />
          {{ t("secret.picker.save") }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { DefaultService as SecretService, type Secret } from "../lib";
import { Button } from "core-fe-lib/components-shadcn/ui/button";
import { Input } from "core-fe-lib/components-shadcn/ui/input";
import { Label } from "core-fe-lib/components-shadcn/ui/label";
import { Check, Copy, KeyRound, Loader2, Plus } from "lucide-vue-next";

export interface SecretUsage {
  secretName: string;
  usageCount: number;
}

const props = defineProps<{
  modelValue: string | null; // selected secret name
  connectorType: string; // filter (e.g. "jira")
  label: string; // e.g. "Authentication"
  valueLabel: string; // e.g. "Jira API Token"
  valuePlaceholder?: string;
  docsUrl?: string;
  // Optional usage-count fetcher. When provided, the picker annotates each
  // existing secret with how many places reference it. Consumers decide
  // where "usage" comes from — this component stays decoupled.
  fetchUsage?: () => Promise<SecretUsage[]>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string | null): void;
}>();

const { t } = useI18n();

const secrets = ref<Secret[]>([]);
const usage = ref<Record<string, number>>({});
const loading = ref(false);
const creating = ref(false);
const saving = ref(false);
const createError = ref("");
// One-time reveal of a server-generated secret. Populated by `generate`;
// cleared by `dismissReveal`. While set, the picker shows the reveal panel
// instead of the form so the user must explicitly acknowledge the value.
const revealed = ref<{ name: string; value: string } | null>(null);
const copied = ref(false);

function usageCount(name: string): number {
  return usage.value[name] ?? 0;
}

const newSecret = ref({ name: "", value: "", description: "" });

const canCreate = computed(
  () => newSecret.value.name.trim() && newSecret.value.value.trim()
);

async function fetchSecrets() {
  loading.value = true;
  try {
    const list = await SecretService.listSecrets(
      undefined,
      props.connectorType
    );
    secrets.value = (list as Secret[]) ?? [];
  } catch {
    secrets.value = [];
  } finally {
    loading.value = false;
  }
  // Usage annotation is best-effort and decorative — fetched separately so a
  // failing (or removed) usage endpoint can never blank the secret list, which
  // would make a just-created secret look like it didn't get selected.
  try {
    const usageList = (await props.fetchUsage?.()) ?? [];
    const map: Record<string, number> = {};
    for (const u of usageList) {
      map[u.secretName] = u.usageCount;
    }
    usage.value = map;
  } catch {
    usage.value = {};
  }
}

function selectExisting(name: string) {
  emit("update:modelValue", name);
}

function suggestedName(): string {
  const base = props.connectorType || "secret";
  if (!secrets.value.some((s) => s.name === base)) return base;
  let i = 2;
  while (secrets.value.some((s) => s.name === `${base}_${i}`)) i += 1;
  return `${base}_${i}`;
}

function enterCreateMode() {
  creating.value = true;
  newSecret.value = { name: suggestedName(), value: "", description: "" };
}

function cancelCreate() {
  creating.value = false;
  createError.value = "";
  newSecret.value = { name: "", value: "", description: "" };
}

async function save() {
  saving.value = true;
  createError.value = "";
  try {
    // Shared secret-lib endpoint (POST /admin-api/v1/secret/secrets)
    // — single source of truth, module-agnostic. The former
    // aiemployee-local route is gone.
    await SecretService.createSecret({
      name: newSecret.value.name.trim(),
      value: newSecret.value.value,
      connector_type: props.connectorType,
      description: newSecret.value.description || undefined,
    });
    const created = newSecret.value.name.trim();
    await fetchSecrets();
    emit("update:modelValue", created);
    cancelCreate();
  } catch (e: any) {
    createError.value =
      e?.body?.message || e?.message || "Failed to create secret";
  } finally {
    saving.value = false;
  }
}

// generate calls the server-side generator (POST /admin-api/v1/secret/secrets/generate).
// The server mints + stores the random value and returns the plaintext exactly
// once. We surface it via the reveal panel and immediately select the new
// secret so the consuming form can save.
async function generate() {
  if (!newSecret.value.name.trim()) {
    createError.value = "Name is required before generating.";
    return;
  }
  saving.value = true;
  createError.value = "";
  try {
    const res = await SecretService.generateSecret({
      name: newSecret.value.name.trim(),
      connector_type: props.connectorType,
      description: newSecret.value.description || undefined,
    });
    const createdName = newSecret.value.name.trim();
    revealed.value = { name: createdName, value: res.value };
    copied.value = false;
    await fetchSecrets();
    emit("update:modelValue", createdName);
    creating.value = false;
  } catch (e: any) {
    createError.value =
      e?.body?.message || e?.message || "Failed to generate secret";
  } finally {
    saving.value = false;
  }
}

async function copyRevealed() {
  if (!revealed.value) return;
  try {
    await navigator.clipboard.writeText(revealed.value.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    // Clipboard API can fail in non-secure contexts; user can still
    // triple-click + Cmd-C the readonly input.
  }
}

function dismissReveal() {
  revealed.value = null;
  copied.value = false;
  newSecret.value = { name: "", value: "", description: "" };
}

watch(() => props.connectorType, fetchSecrets);
onMounted(fetchSecrets);
</script>
