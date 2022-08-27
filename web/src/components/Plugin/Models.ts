import { Uri, editor } from "monaco-editor";
import*as modelCode from './modelCode/index'

export const authzcasbinModel = editor.createModel(
    modelCode.authzcasbin,
    "json",
    Uri.parse("file:authz-casbin")
  );

export const opaModel = editor.createModel(
  modelCode.opa,
  "json",
  Uri.parse("file:tsconfig.json")
);
