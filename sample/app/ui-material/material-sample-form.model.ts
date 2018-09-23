import {
    DynamicCheckboxModel,
    DynamicDatePickerModel,
    DynamicFormGroupModel,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicSelectModel,
    DynamicSwitchModel,
    DynamicTextAreaModel,
    DynamicFormArrayModel
} from "@ng-dynamic-forms/core";
import { BehaviorSubject } from "rxjs";

export const STATES_AUTOCOMPLETE_LIST = [
    "Alabama", "Alaska", "American Samoa", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "District of Columbia", "Federated States of Micronesia", "Florida", "Georgia", "Guam", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Marshall Islands", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
    "Northern Mariana Islands", "Ohio", "Oklahoma", "Oregon", "Palau", "Pennsylvania", "Puerto Rico", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virgin Island", "Virginia",
    "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export const MATERIAL_SAMPLE_FORM_MODEL = [

    new DynamicCheckboxModel({
        id: "dynamicStuff",
        label: "Dynamic Stuff",
        additional: {
            color: "primary"
        }
    }),

    new DynamicFormArrayModel({
        id: "sampleArray",
        initialCount: 3,
        groupFactory: () => [
            new DynamicRadioGroupModel<string>({
                id: "duck",
                additional: {
                    color: "primary"
                },
                options: [
                    {
                        label: "Huey",
                        value: "huey"
                    },
                    {
                        label: "Dewey",
                        value: "dewey"
                    },
                    {
                        label: "Louie",
                        value: "louie"
                    }
                ],
                value: "cc"
            })
        ]
    }),

    new DynamicFormGroupModel({

        id: "stay",
        group: [
            new DynamicDatePickerModel({

                id: "arrivalDate",
                inline: false,
                placeholder: "Date of Arrival"
            }),

            new DynamicDatePickerModel({
                id: "departureDate",
                inline: false,
                placeholder: "Date of Departure"
            })
        ],
        validators: {
            customDateRangeValidator: null
        },
        errorMessages: {
            customDateRangeValidator: "Invalid period of time selected"
        }
    }),

    new DynamicFormGroupModel({

        id: "room",
        group: [
            new DynamicSelectModel<string>({

                id: "roomSize",
                placeholder: "Room Size",
                hint: "Choose a room type",
                options: [
                    {
                        label: "Single Room",
                        value: "single-room"
                    },
                    {
                        label: "Double Room",
                        value: "double-room"
                    },
                    {
                        label: "Business Suite",
                        value: "business-suite"
                    },
                    {
                        label: "Presidential Suite",
                        value: "presidential-suite"
                    },
                    {
                        label: "Storeroom",
                        value: "storeroom"
                    }
                ]
            }),

            new DynamicInputModel({
                hidden: true,
                id: "roomQuantity",
                inputType: "number",
                placeholder: "Room Quantity",
                hint: "Maximum: 5",
                max: 5,
                min: 0
            })
        ]
    }),

    new DynamicInputModel({

        id: "firstName",
        maxLength: 25,
        placeholder: "First Name",
        validators: {
            required: null
        },
        errorMessages: {
            required: "Field is required"
        },
        relation: [
            {
                action: "DISABLE",
                when: [
                    {
                        id: "dynamicStuff",
                        operator: "===",
                        value: true
                    }
                ]
            }
        ]
    }),

    new DynamicInputModel({

        id: "lastName",
        maxLength: 50,
        placeholder: "Last Name",
        validators: {
            required: null
        },
        errorMessages: {
            required: "Field is required"
        },
        additional: {
            color: "accent"
        },
        relation: [
            {
                action: "DISABLE",
                when: [
                    {
                        id: "dynamicStuff",
                        operator: "===",
                        value: false
                    }
                ]
            }
        ]
    }),

    new DynamicInputModel({

        id: "email",
        placeholder: "E-Mail",
        hidden: true,
        validators: {
            email: null
        },
        errorMessages: {
            email: "Field has no valid email"
        },
        relation: [
            {
                action: "HIDDEN",
                when: [
                    {
                        id: "dynamicStuff",
                        operator: "===",
                        value: true
                    }
                ]
            }
        ]
    }),

    new DynamicInputModel({

        id: "phone",
        inputType: "tel",
        placeholder: "Phone Number",
        hint: "Add your country code first",
        prefix: "+",
        validators: {
            required: null
        },
        errorMessages: {
            required: "Field is required"
        },
        relation: [
            {
                action: "VISIBLE",
                when: [
                    {
                        id: "dynamicStuff",
                        operator: "===",
                        value: true
                    }
                ]
            }
        ]
    }),

    new DynamicFormGroupModel({

        id: "addressStreet",
        group: [

            new DynamicInputModel({
                id: "streetName",
                placeholder: "Street Name"
            }),

            new DynamicInputModel({
                id: "streetNumber",
                placeholder: "Street Number"
            })
        ]
    }),

    new DynamicFormGroupModel({

        id: "addressLocation",
        group: [
            new DynamicInputModel({

                id: "zipCode",
                placeholder: "ZIP"
            }),

            new DynamicInputModel({

                id: "state",
                hint: "Autocomplete",
                placeholder: "State",
                list: new BehaviorSubject(STATES_AUTOCOMPLETE_LIST)
            }),

            new DynamicInputModel({

                id: "city",
                placeholder: "City"
            })
        ]
    }),

    new DynamicSelectModel<string>({

        id: "extras",
        placeholder: "Extras",
        multiple: true,
        options: [
            {
                label: "Breakfast",
                value: "extraBreakfast"
            },
            {
                label: "TV",
                value: "extraTV",
            },
            {
                label: "WiFi",
                value: "extraWiFi"
            },
            {
                label: "Parking Lot",
                value: "extraParking"
            },
            {
                label: "Balcony",
                value: "extraBalcony"
            }
        ]
    }),

    new DynamicRadioGroupModel<string>({

        id: "payment",
        additional: {
            color: "primary"
        },
        options: [
            {
                label: "Credit Card",
                value: "cc"
            },
            {
                label: "PayPal",
                value: "paypal"
            },
            {
                label: "Cash",
                value: "cash"
            },
            {
                label: "Bitcoin",
                value: "bitcoin"
            }
        ],
        value: "cc"
    }),

    new DynamicTextAreaModel({

        id: "note",
        rows: 3,
        maxLength: 100,
        placeholder: "Personal Note"
    }),

    new DynamicInputModel({

        id: "tags",
        placeholder: "Tags",
        multiple: true,
        value: ["hotel", "booking"]
    }),

    new DynamicSwitchModel({

        id: "reminder",
        offLabel: "Send me a reminder",
        onLabel: "Send me a reminder",
        value: false,
        additional: {
            color: "primary"
        }
    }),

    new DynamicSwitchModel({

        id: "newsletter",
        offLabel: "Subscribe to newsletter",
        onLabel: "Subscribe to newsletter",
        value: true,
        additional: {
            color: "primary"
        }
    }),

    new DynamicCheckboxModel({
        id: "confirm",
        label: "I confirm the information given above",
        additional: {
            color: "primary"
        }
    })
];
