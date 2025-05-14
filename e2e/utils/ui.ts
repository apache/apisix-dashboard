import { Page } from "@playwright/test";
import { FileRouteTypes } from "@src/routeTree.gen";
import { env } from "./env";

export const uiGoto = (page: Page, path: FileRouteTypes['to']) => {
  return page.goto(`${env.E2E_TARGET_URL}${path.substring(1)}`);
};
