import { CommonModule } from "@angular/common";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicIdDirective } from "./directive/dynamic-id.directive";
import { DynamicListDirective } from "./directive/dynamic-list.directive";
import { DynamicTemplateDirective } from "./directive/dynamic-template.directive";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
        DynamicIdDirective,
        DynamicListDirective,
        DynamicTemplateDirective
    ],
    exports: [
        DynamicIdDirective,
        DynamicListDirective,
        DynamicTemplateDirective
    ]
})
export class DynamicFormsCoreModule {

    //@deprecated
    static forRoot(): ModuleWithProviders {
        return {ngModule: DynamicFormsCoreModule};
    }
}