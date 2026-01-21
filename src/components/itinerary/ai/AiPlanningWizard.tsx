import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ItineraryService, type AiItineraryRequest, type AiItineraryResponse, type AiRefinementRequest } from '../../../services/ItineraryService';
import AiInputStep from './AiInputStep';
import AiPreviewStep from './AiPreviewStep';
import toast from 'react-hot-toast';
import './AiPlanning.css';

interface AiPlanningWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newTemplateId?: string) => void;
}

const AiPlanningWizard: React.FC<AiPlanningWizardProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState<AiItineraryResponse | null>(null);

    // Generation Handler
    const handleGenerate = async (request: AiItineraryRequest) => {
        setIsLoading(true);
        try {
            const result = await ItineraryService.generateAiItinerary(request);
            setItinerary(result);
            setStep(2);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to generate itinerary. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Refinement Handler
    const handleRefine = async (request: AiRefinementRequest) => {
        if (!itinerary) return;
        
        // Optimistic / Loading state handled in child
        try {
            const refined = await ItineraryService.refineAiItinerary({
                currentItineraryJson: JSON.stringify(itinerary),
                refinementRequest: request
            });
            setItinerary(refined);
            toast.success("Itinerary updated!");
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to refine itinerary.");
        }
    };

    // Confirm Handler
    const handleConfirm = async () => {
        if (!itinerary) return;
        
        setIsLoading(true);
        try {
            await ItineraryService.confirmAiItinerary(itinerary);
            toast.success("Itinerary saved successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to save itinerary.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="ai-wizard-overlay">
            <div className="ai-wizard-container">
                <div className="ai-wizard-header">
                    <h2 className="ai-wizard-title">
                        <span className="ai-sparkle">✨</span> AI Trip Planner
                    </h2>
                    <button className="ai-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="ai-step-container">
                    {step === 1 && (
                        <AiInputStep 
                            onGenerate={handleGenerate} 
                            onCancel={onClose} 
                            isLoading={isLoading} 
                        />
                    )}

                    {step === 2 && itinerary && (
                        <AiPreviewStep 
                            itinerary={itinerary}
                            onRefine={handleRefine}
                            onConfirm={handleConfirm}
                            onBack={() => setStep(1)}
                        />
                    )}
                </div>

                {isLoading && step === 2 && (
                    <div className="loading-overlay-inner">
                        <div className="spinner"></div>
                        <p>Processing...</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default AiPlanningWizard;
