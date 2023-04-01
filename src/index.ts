import { PluginOption } from "vite";
import { NodePath, transform, traverse, types } from "@babel/core";
import * as generate from "@babel/generator";

const _generate = (generate.default as any).default;

interface Options {
  enable?: boolean;
  // forced substitution, even if already assigned
  force?: boolean;
}

export default function AutoComponentName(options?: Options): PluginOption {
  const {  force = false } = options || {};
  return {
    name: "vite-plugin-vue-auto-component-name",
    transform(code, id) {
      if (!id.endsWith(".vue")) {
        return;
      }
      const result = transform(code, { ast: true });
      const codeAst = result?.ast;
      if (!codeAst) {
        return;
      }
      traverse(codeAst, {
        VariableDeclarator(path: NodePath<types.VariableDeclarator>) {
          replaceSetupName(path, generatorName(id));
          // replace export { name: 'DefineName' }
          if (force) {
            replaceExportName(path, generatorName(id));
          }
        },
      });
      return _generate(codeAst);
    },
  };
}

/**
 * replace <script lang="ts">export default { name: 'DefineName' }</script>
 * @param node
 * @param changeName
 */
function replaceExportName({ node }: NodePath<types.VariableDeclarator>, changeName: string) {
  if (!types.isIdentifier(node.id)
    || node.id.name !== "__default__"
    || !types.isObjectExpression(node.init)
    || !types.isObjectProperty(node.init.properties[0])
    || !types.isIdentifier(node.init.properties[0].key)
    || node.init.properties[0].key.name !== "name"
    || !types.isStringLiteral(node.init.properties[0].value)
  ) {
    return;
  }
  node.init.properties[0].value.value = changeName;
}

function replaceSetupName({ node }: NodePath<types.VariableDeclarator>, changeName: string) {
  if (!types.isIdentifier(node.id)) {
    return;
  }
  const name = node.id.name;
  if (name !== "_sfc_main") {
    return;
  }
  const nodeInit = node.init;
  if (!types.isCallExpression(nodeInit)) {
    return;
  }
  const argList = nodeInit.arguments || [];
  const objectData = argList[0] || {};
  if (
    !types.isObjectExpression(objectData) ||
    !types.isObjectProperty(objectData.properties[0]) ||
    !types.isIdentifier(objectData.properties[0].key) ||
    !types.isStringLiteral(objectData.properties[0].value)
  ) {
    return;
  }
  const keyName = objectData.properties[0].key.name;
  if (keyName !== "__name") {
    return;
  }
  // replace old name
  objectData.properties[0].value.value = changeName;
}

/**
 * generator component name
 * @param id
 */
function generatorName(id: string): string {
  const dirAndFileNameList = id.split("/");
  const fileName: string = dirAndFileNameList.pop()!;
  const lastName = dirAndFileNameList.pop();
  let dirName = (lastName === "src" ? "root" : dirAndFileNameList.pop()) + " > " + lastName;
  return fileName.split(".").shift() + ` (${ dirName })`;
}
