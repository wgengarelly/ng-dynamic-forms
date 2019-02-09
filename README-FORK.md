# To Sync with Original

https://help.github.com/articles/syncing-a-fork/

1. git fetch upstream
1. git checkout master
1. git merge upstream/master
1. Handle any conflicts
1. git push

# Build and Modify Version
1. Build the packages. **You may need to run your console as administrator and/or close your dev editor to avoid npm unlinking problems.**
    ```
    npm run build:packages
    ```
1. Add the forked suffix to the versions and peer dependencies in the dist folder.
(This is currently a manual task.)

    For example in dist\@ng-dynamic-forms\core\package.json:
    `"version": "6.2.0-forked.1"`

    Or in dist\@ng-dynamic-forms\ui-material\package.json:
    `"version": "6.2.0-forked.1"`
    ...
    `"@ng-dynamic-forms/core": "^6.2.0-forked.1",`

# Publish to local npm (Verdaccio)
Your can have a local npm registry in Verdaccio and run it in Docker with
the following `docker.componse.yaml` file. I'm just running it in a local `DockerSandbox` folder.

```
version: '2.1'
services:
  verdaccio:
    image: verdaccio/verdaccio
    container_name: local-npm-verdaccio
    ports:
      - "4873:4873"
    volumes:
        - "./storage:/verdaccio/storage"
        - "./conf:/verdaccio/conf"
        - "./plugins:/verdaccio/plugins"
volumes:
  verdaccio:
    driver: local
```

1. Start the `verdaccio/verdaccio` docker container.
1. `cd` to the correct dist folder. For example:
    ```
    cd .\dist\@ng-dynamic-forms\core
    ```
1. Publish to the local container.
    ```
    npm publish --registry http://localhost:4873
    ```

# List of Overrides in the Fork:

## packages > ui-material >> dynamic-material-form-input-control.component.ts
- Changed `showCharacterHint` to hide hint unless character count is > 75% of the max length.

## packages > ui-material >> dynamic-material-radio-group.component.html
- Added `[color]` attribute to mat-radio-button.
- Removed `[name]` from mat-radio-group.

## packages > core >> utils > relation-compare-operators.utils.ts
- Added this file to support additional relations

## packages > core >> utils > relation.utils.ts
- Significant changes to support HIDDEN / VISIBLE relations. See code below.

#### Begin new core/src/model/misc/dynamic-form-control-relation.model.ts
```
export const DYNAMIC_FORM_CONTROL_ACTION_DISABLE = "DISABLE";
export const DYNAMIC_FORM_CONTROL_ACTION_ENABLE = "ENABLE";
export const DYNAMIC_FORM_CONTROL_ACTION_VISIBLE = "VISIBLE";
export const DYNAMIC_FORM_CONTROL_ACTION_HIDDEN = "HIDDEN";
export const DYNAMIC_FORM_CONTROL_ACTION_HIDDEN_DISABLE = "HIDDEN_DISABLE";
export const DYNAMIC_FORM_CONTROL_ACTION_VISIBLE_ENABLE = "VISIBLE_ENABLE";
export const DYNAMIC_FORM_CONTROL_ACTION_REQUIRED = "REQUIRED";

export const DYNAMIC_FORM_CONTROL_CONNECTIVE_AND = "AND";
export const DYNAMIC_FORM_CONTROL_CONNECTIVE_OR = "OR";

export interface DynamicFormControlRelation {

    id: string;
    operator?: string;
    status?: string;
    value?: any;
}

export interface DynamicFormControlRelationGroup {

    action: string;
    connective?: string;
    when: DynamicFormControlRelation[];
}
```
#### End new core/src/service/dynamic-form-control-relation.model.ts

#### Begin new core/src/utils/relation.utils.ts
```
import {
  FormGroup,
  FormControl,
  FormArray,
  AbstractControl
} from "@angular/forms";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import {
  DynamicFormControlRelation,
  DynamicFormControlRelationGroup,
  DYNAMIC_FORM_CONTROL_ACTION_DISABLE,
  DYNAMIC_FORM_CONTROL_ACTION_ENABLE,
  DYNAMIC_FORM_CONTROL_ACTION_HIDDEN,
  DYNAMIC_FORM_CONTROL_ACTION_VISIBLE,
  DYNAMIC_FORM_CONTROL_ACTION_HIDDEN_DISABLE,
  DYNAMIC_FORM_CONTROL_ACTION_VISIBLE_ENABLE,
  DYNAMIC_FORM_CONTROL_ACTION_REQUIRED,
  DYNAMIC_FORM_CONTROL_CONNECTIVE_AND,
  DYNAMIC_FORM_CONTROL_CONNECTIVE_OR
} from "../model/misc/dynamic-form-control-relation.model";

import { COMPARE_OPERATOR } from "./relation-compare-operators.utils";

function runOperation(operator: string, valueA: any, valueB: any): boolean {
  const op = operator || "===";
  const operation = COMPARE_OPERATOR[op]
    ? COMPARE_OPERATOR[op]
    : COMPARE_OPERATOR["==="];
  return operation(valueA, valueB);
}

function isActionPositive(action: string): boolean {
  switch (action) {
    case DYNAMIC_FORM_CONTROL_ACTION_ENABLE:
    case DYNAMIC_FORM_CONTROL_ACTION_VISIBLE:
    case DYNAMIC_FORM_CONTROL_ACTION_VISIBLE_ENABLE:
    case DYNAMIC_FORM_CONTROL_ACTION_REQUIRED:
      return true;
    default:
      return false;
  }
}

/**
 * Gets a child control in the specified control, or in any of the
 * control's parents.
 * @param id
 * @param controlToSearch
 */
function getControl(
  id: string,
  controlToSearch: AbstractControl
): FormControl | null | undefined {
  let control: FormControl | null | undefined = controlToSearch.get(
    id
  ) as FormControl;
  if (!control && controlToSearch.parent !== undefined) {
    control = getControl(id, controlToSearch.parent);
  }
  return control;
}

function isActionTriggered(
  relGroup: DynamicFormControlRelationGroup,
  _formGroup: FormGroup
): boolean {
  let formGroup: FormGroup = _formGroup;

  return relGroup.when.reduce(
    (
      toBeTriggered: boolean,
      rel: DynamicFormControlRelation,
      index: number
    ) => {
      // const control = formGroup.get(rel.id);
      const control = getControl(rel.id, formGroup);
      const isPositive = isActionPositive(relGroup.action);

      if (control && !isPositive) {
        if (
          index > 0 &&
          relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND &&
          !toBeTriggered
        ) {
          return false;
        }

        if (
          index > 0 &&
          relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR &&
          toBeTriggered
        ) {
          return true;
        }

        return rel.value === null && rel.status !== null
          ? runOperation(rel.operator || "===", control.status, rel.status) ||
              false
          : runOperation(rel.operator || "===", control.value, rel.value) ||
              false;
      }

      if (control && isPositive) {
        if (
          index > 0 &&
          relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND &&
          toBeTriggered
        ) {
          return true;
        }

        if (
          index > 0 &&
          relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR &&
          !toBeTriggered
        ) {
          return false;
        }

        const result =
          rel.value === null && rel.status !== null
            ? runOperation(rel.operator || "===", control.status, rel.status) ||
              false
            : runOperation(rel.operator || "===", control.value, rel.value) ||
              false;

        return !result;
      }

      return false;
    },
    false
  );
}

export function findActivationRelations(
  relGroups: DynamicFormControlRelationGroup[]
): DynamicFormControlRelationGroup[] | null {
  const rel = relGroups.filter(rel => {
    return (
      rel.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE ||
      rel.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE ||
      rel.action === DYNAMIC_FORM_CONTROL_ACTION_HIDDEN ||
      rel.action === DYNAMIC_FORM_CONTROL_ACTION_VISIBLE ||
      rel.action === DYNAMIC_FORM_CONTROL_ACTION_HIDDEN_DISABLE ||
      rel.action === DYNAMIC_FORM_CONTROL_ACTION_VISIBLE_ENABLE
    );
  });

  return rel !== undefined ? rel : null;
}

export function findRequiredRelation(
  relGroups: DynamicFormControlRelationGroup[]
): DynamicFormControlRelationGroup | null {
  let rel = relGroups.find(rel => {
    return rel.action === DYNAMIC_FORM_CONTROL_ACTION_REQUIRED;
  });

  return rel !== undefined ? rel : null;
}

export function getRelatedFormControls(
  model: DynamicFormControlModel,
  controlGroup: FormGroup
): FormControl[] {
  const controls: FormControl[] = [];

  model.relation.forEach(relGroup =>
    relGroup.when.forEach(rel => {
      if (model.id === rel.id) {
        throw new Error(`FormControl ${model.id} cannot depend on itself`);
      }

      const control = getControl(rel.id, controlGroup);
      if (
        control &&
        !controls.some(controlElement => controlElement === control)
      ) {
        controls.push(control);
      }
    })
  );

  return controls;
}

export function isFormControlToBeDisabled(
  relGroup: DynamicFormControlRelationGroup,
  _formGroup: FormGroup
): boolean {
  if (
    relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_DISABLE &&
    relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_ENABLE
  ) {
    return false;
  }
  return isActionTriggered(relGroup, _formGroup);
}

export function isFormControlToBeHidden(
  relGroup: DynamicFormControlRelationGroup,
  _formGroup: FormGroup
): boolean {
  if (
    relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_HIDDEN &&
    relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_VISIBLE
  ) {
    return false;
  }
  return isActionTriggered(relGroup, _formGroup);
}

export function isFormControlToBeHiddenAndDisabled(
  relGroup: DynamicFormControlRelationGroup,
  _formGroup: FormGroup
): boolean {
  if (
    relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_HIDDEN_DISABLE &&
    relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_VISIBLE_ENABLE
  ) {
    return false;
  }
  return isActionTriggered(relGroup, _formGroup);
}

export function isFormControlToBeRequired(
  relGroup: DynamicFormControlRelationGroup,
  _formGroup: FormGroup
): boolean {
  if (relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_REQUIRED) {
    return false;
  }
  return isActionTriggered(relGroup, _formGroup);
}
```
#### End new core/src/utils/relation.utils.ts
