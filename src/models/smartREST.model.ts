export interface SmartRESTConfiguration {
    smartRestFields: {
        api: string;
        byId: boolean;
        customValues: {path: string; type: string; value: string} [];
        externalIdType?: string;
        mandatoryValues?: {path: string; type: string; value: string} [];
        method: string;
        msgId: string;
        name?: string; 
        response?: boolean;
    },
    templateId: string
};
