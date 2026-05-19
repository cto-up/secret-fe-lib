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
            Used by {{ usageCount(s.name) }}
            {{ usageCount(s.name) === 1 ? "agent" : "agents" }}
          </div>
        </div>
      </div>

      <div
        v-if="loading"
        class="text-center py-2 text-sm text-muted-foreground"
      >
        Loading…
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        class="w-full"
        @click="creating = true"
      >
        <Plus class="h-4 w-4 mr-2" /> Create new secret
      </Button>
    </div>

    <!-- Inline create form -->
    <div v-else class="rounded-md border p-4 space-y-3 bg-muted/20">
      <div class="space-y-1">
        <Label for="new-secret-name"
          >Name <span class="text-destructive">*</span></Label
        >
        <Input
          id="new-secret-name"
          v-model="newSecret.name"
          :placeholder="`e.g. ${connectorType}-prod`"
        />
      </div>
      <div class="space-y-1">
        <Label for="new-secret-value"
          >{{ valueLabel }} <span class="text-destructive">*</span></Label
        >
        <Input
          id="new-secret-value"
          v-model="newSecret.value"
          type="password"
          :placeholder="valuePlaceholder"
        />
        <p v-if="docsUrl" class="text-xs text-muted-foreground">
          Need one?
          <a
            :href="docsUrl"
            target="_blank"
            rel="noopener"
            class="underline text-primary"
          >
            Get your {{ valueLabel }}
          </a>
        </p>
      </div>
      <div class="space-y-1">
        <Label for="new-secret-desc">Description (optional)</Label>
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
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          :disabled="!canCreate || saving"
          @click="save"
        >
          <Loader2 v-if="saving" class="h-3 w-3 mr-2 animate-spin" />
          Save secret
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { DefaultService as SecretService, type Secret } from "../lib";
import { Button } from "core-fe-lib/components-shadcn/ui/button";
import { Input } from "core-fe-lib/components-shadcn/ui/input";
import { Label } from "core-fe-lib/components-shadcn/ui/label";
import { Loader2, Plus } from "lucide-vue-next";

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

const secrets = ref<Secret[]>([]);
const usage = ref<Record<string, number>>({});
const loading = ref(false);
const creating = ref(false);
const saving = ref(false);
const createError = ref("");

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
    const [list, usageList] = await Promise.all([
      SecretService.listSecrets(undefined, props.connectorType),
      props.fetchUsage?.() ?? Promise.resolve([] as SecretUsage[]),
    ]);
    secrets.value = (list as Secret[]) ?? [];
    const map: Record<string, number> = {};
    for (const u of usageList ?? []) {
      map[u.secretName] = u.usageCount;
    }
    usage.value = map;
  } catch {
    secrets.value = [];
    usage.value = {};
  } finally {
    loading.value = false;
  }
}

function selectExisting(name: string) {
  emit("update:modelValue", name);
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

watch(() => props.connectorType, fetchSecrets);
onMounted(fetchSecrets);
</script>
