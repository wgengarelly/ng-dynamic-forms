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
