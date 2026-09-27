import { type MenuLink } from "core-fe-lib/components-shadcn/types/menu-link";
import { Role } from "core-fe-lib/openapi/core/models/Role";

/** Where to file Secrets as an entry of a shared section instead of a
 *  section of its own. */
export interface SecretNavSection {
  id: string;
  order: number;
}

export function getSecretLinks(
  t: (key: string) => string,
  icon: string = "lock",
  section?: SecretNavSection
): MenuLink[] {
  if (section) {
    return [
      {
        sectionId: section.id,
        sectionOrder: section.order,
        icon,
        items: [
          {
            title: t("layout.navigation.secret.title"),
            caption: t("layout.navigation.secret.manage.caption"),
            icon,
            link: "/admin/secrets",
            requiredPrivilege: Role.ADMIN,
          },
        ],
      },
    ];
  }
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
