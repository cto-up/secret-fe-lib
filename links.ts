import { type MenuLink } from "core-fe-lib/components-shadcn/types/menu-link";
import { Role } from "core-fe-lib/openapi/core/models/Role";

export function getSecretLinks(t: any, icon: string = "lock"): MenuLink[] {
  return [
    {
      title: t("layout.navigation.secret.title"),
      caption: t("layout.navigation.secret.caption"),
      icon,
      items: [
        {
          title: t("layout.navigation.secret.manage.title"),
          caption: t("layout.navigation.secret.manage.caption"),
          icon,
          link: "/admin/secrets",
          requiredPrivilege: Role.ADMIN,
        },
      ],
    },
  ];
}
