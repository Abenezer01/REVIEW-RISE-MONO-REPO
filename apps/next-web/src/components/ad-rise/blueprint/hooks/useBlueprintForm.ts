import { useState } from 'react';
import type { BlueprintInput } from '@platform/contracts';
import type { QuickTemplate } from '../data/quick-templates';

export interface UseBlueprintFormReturn {
    formData: BlueprintInput;
    setFormData: React.Dispatch<React.SetStateAction<BlueprintInput>>;
    serviceInput: string;
    setServiceInput: React.Dispatch<React.SetStateAction<string>>;
    painPointInput: string;
    setPainPointInput: React.Dispatch<React.SetStateAction<string>>;
    handleAddService: () => void;
    handleRemoveService: (index: number) => void;
    handleAddPainPoint: () => void;
    handleRemovePainPoint: (index: number) => void;
    applyTemplate: (template: QuickTemplate) => void;
    validateStep: (step: number) => boolean;
}

export function useBlueprintForm(): UseBlueprintFormReturn {
    const [formData, setFormData] = useState<BlueprintInput>({
        businessName: '',
        services: [],
        offer: '',
        vertical: 'Local Service',
        geo: '',
        painPoints: [],
        landingPageUrl: '',
        objective: 'Leads',
        budget: 0,
    });

    const [serviceInput, setServiceInput] = useState('');
    const [painPointInput, setPainPointInput] = useState('');

    const handleAddService = () => {
        if (serviceInput.trim()) {
            setFormData(prev => ({ ...prev, services: [...prev.services, serviceInput.trim()] }));
            setServiceInput('');
        }
    };

    const handleRemoveService = (index: number) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.filter((_, idx) => idx !== index)
        }));
    };

    const handleAddPainPoint = () => {
        if (painPointInput.trim()) {
            setFormData(prev => ({ ...prev, painPoints: [...(prev.painPoints || []), painPointInput.trim()] }));
            setPainPointInput('');
        }
    };

    const handleRemovePainPoint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            painPoints: (prev.painPoints || []).filter((_, idx) => idx !== index)
        }));
    };

    const applyTemplate = (template: QuickTemplate) => {
        setFormData(prev => ({
            ...prev,
            ...template.data
        }));
    };

    const validateStep = (step: number): boolean => {
        if (step === 0) {
            return !!(
                formData.businessName &&
                formData.services.length > 0 &&
                formData.offer &&
                formData.geo &&
                formData.budget
            );
        }


return true;
    };

    return {
        formData,
        setFormData,
        serviceInput,
        setServiceInput,
        painPointInput,
        setPainPointInput,
        handleAddService,
        handleRemoveService,
        handleAddPainPoint,
        handleRemovePainPoint,
        applyTemplate,
        validateStep,
    };
}
