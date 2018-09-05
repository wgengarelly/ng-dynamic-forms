import { FormGroup, FormControl, FormArray, AbstractControl } from "@angular/forms";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import {
    DynamicFormControlRelation,
    DynamicFormControlRelationGroup,
    DYNAMIC_FORM_CONTROL_ACTION_DISABLE,
    DYNAMIC_FORM_CONTROL_ACTION_ENABLE,
    DYNAMIC_FORM_CONTROL_ACTION_HIDDEN,
    DYNAMIC_FORM_CONTROL_ACTION_VISIBLE,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_AND,
    DYNAMIC_FORM_CONTROL_CONNECTIVE_OR
} from "../model/misc/dynamic-form-control-relation.model";

import { COMPARE_OPERATOR } from "./relation-compare-operators.utils";

export class RelationUtils {

    static runOperation(operator: string, valueA: any, valueB: any): boolean {
        const op = operator || "===";
        const operation = COMPARE_OPERATOR[op] ? COMPARE_OPERATOR[op] : COMPARE_OPERATOR["==="];
        return operation(valueA, valueB);
    }

    static isActionPositive(action: string): boolean {
        switch (action) {
            case DYNAMIC_FORM_CONTROL_ACTION_ENABLE:
            case DYNAMIC_FORM_CONTROL_ACTION_VISIBLE:
                return true;
            default:
                return false;
        }
    }

    static findActivationRelations(relGroups: DynamicFormControlRelationGroup[]): DynamicFormControlRelationGroup[] | null {
        const rel = relGroups.filter(rel => {
            return rel.action === DYNAMIC_FORM_CONTROL_ACTION_DISABLE ||
                rel.action === DYNAMIC_FORM_CONTROL_ACTION_ENABLE ||
                rel.action === DYNAMIC_FORM_CONTROL_ACTION_HIDDEN ||
                rel.action === DYNAMIC_FORM_CONTROL_ACTION_VISIBLE;
        });

        return rel !== undefined ? rel : null;
    }

    static getRelatedFormControls(model: DynamicFormControlModel, controlGroup: FormGroup): FormControl[] {

        const controls: FormControl[] = [];

        model.relation.forEach(relGroup => relGroup.when.forEach(rel => {
            if (model.id === rel.id) {
                throw new Error(`FormControl ${model.id} cannot depend on itself`);
            }

            const control = RelationUtils.getControl(rel.id, controlGroup);
            if (control && !controls.some(controlElement => controlElement === control)) {
                controls.push(control);
            }
        }));

        return controls;
    }

    /**
     * Gets a child control in the specified control, or anywhere below the
     * specified control's parent root.
     * @param id
     * @param controlToSearch
     */
    static getControl(id: string, controlToSearch: AbstractControl) {
        let control: FormControl | null | undefined = controlToSearch.get(id) as FormControl;
        if (!control) {
            control = RelationUtils.getControlBelowRoot(id, controlToSearch.root);
        }
        return control;
    }

    /**
     * Gets the control with the matching id from the specified root and its children.
     * FormGroup.get will only find a control in the current group.
     * @param id
     * @param rootControl
     */
    static getControlBelowRoot(id: string, rootControl: AbstractControl): FormControl | null {

        if (!rootControl) {
            return null;
        }

        const control = rootControl.get(id);
        if (control) {
            return (control instanceof FormControl) ? control : null;
        }

        if (rootControl instanceof FormGroup || rootControl instanceof FormArray) {
            for (const key in rootControl.controls) {
                const subControl = rootControl.get(key);
                if (subControl instanceof FormGroup) {
                    const childControl = RelationUtils.getControlBelowRoot(id, subControl);
                    if (childControl) {
                        return childControl;
                    }
                }
            }
        }

        return null;
    }

    static isActionTriggered(relGroup: DynamicFormControlRelationGroup, _formGroup: FormGroup): boolean {

        let formGroup: FormGroup = _formGroup;

        return relGroup.when.reduce((toBeTriggered: boolean, rel: DynamicFormControlRelation, index: number) => {

            // const control = formGroup.get(rel.id);
            const control = RelationUtils.getControl(rel.id, formGroup);
            const isActionPositive = RelationUtils.isActionPositive(relGroup.action);

            if (control && !isActionPositive) {
                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && !toBeTriggered) {
                    return false;
                }

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && toBeTriggered) {
                    return true;
                }

                return (rel.value === null && rel.status !== null) ?
                    RelationUtils.runOperation(rel.operator || "===", control.status, rel.status) || false :
                    RelationUtils.runOperation(rel.operator || "===", control.value, rel.value) || false;
            }

            if (control && isActionPositive) {
                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_AND && toBeTriggered) {
                    return true;
                }

                if (index > 0 && relGroup.connective === DYNAMIC_FORM_CONTROL_CONNECTIVE_OR && !toBeTriggered) {
                    return false;
                }

                const result = (rel.value === null && rel.status !== null) ?
                    RelationUtils.runOperation(rel.operator || "===", control.status, rel.status) || false :
                    RelationUtils.runOperation(rel.operator || "===", control.value, rel.value) || false;

                return !result;
            }

            return false;

        }, false);

    }

    static isFormControlToBeDisabled(relGroup: DynamicFormControlRelationGroup, _formGroup: FormGroup): boolean {
        if (relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_DISABLE && relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_ENABLE) {
            return false;
        }
        return RelationUtils.isActionTriggered(relGroup, _formGroup);
    }

    static isFormControlToBeHidden(relGroup: DynamicFormControlRelationGroup, _formGroup: FormGroup): boolean {
        if (relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_HIDDEN && relGroup.action !== DYNAMIC_FORM_CONTROL_ACTION_VISIBLE) {
            return false;
        }
        return RelationUtils.isActionTriggered(relGroup, _formGroup);
    }
}