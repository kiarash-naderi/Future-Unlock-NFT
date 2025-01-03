import React, { useState } from 'react';
import TimeInput from './TimeInput';
import { validateFormData } from '../services/nftService';
import { Send } from 'lucide-react';
import { getUnlockTimestamp } from '../utils/timeUtils';

const CreateForm = ({ selectedNFT, onSubmit, walletAddress }) => {
    const [message, setMessage] = useState('');
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [recipientAddress, setRecipientAddress] = useState(walletAddress || '');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleTimeChange = ({ days, hours, minutes }) => {
        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        if (errors.time) {
            setErrors(prev => ({ ...prev, time: null }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate minimum time
        if (days === 0 && hours === 0 && minutes === 0) {
            setErrors({ ...errors, time: 'Lock time must be greater than 0' });
            return;
        }

        const formData = {
            message: message.trim(),
            lockDays: parseInt(days),
            lockHours: parseInt(hours),
            lockMinutes: parseInt(minutes),
            recipient: recipientAddress.trim(),
            // Make sure these are properly converted to integers
            days: parseInt(days),
            hours: parseInt(hours),
            minutes: parseInt(minutes)
        };

        console.log('Submitting form with time values:', {
            days: formData.days,
            hours: formData.hours,
            minutes: formData.minutes,
            totalMinutes: (formData.days * 24 * 60) + (formData.hours * 60) + formData.minutes
        });

        try {
            const validation = validateFormData(formData);
            if (!validation.isValid) {
                setErrors(validation.errors);
                return;
            }

            await onSubmit(formData);
        } catch (error) {
            console.error('Error in form submission:', error);
            setErrors({ ...errors, submit: error.message });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl space-y-6">
            {/* Message Input */}
            <div>
                <label className="block mb-2 text-gray-300 text-lg">Message</label>
                <textarea
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors({ ...errors, message: null });
                    }}
                    className={`w-full p-4 bg-gray-900 border rounded-xl text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             ${errors.message ? 'border-red-500' : 'border-gray-700'}`}
                    rows={4}
                    placeholder="Write your message here..."
                />
                {errors.message && (
                    <p className="mt-1 text-red-500 text-sm">{errors.message}</p>
                )}
            </div>

            {/* Time Input */}
            <TimeInput
                days={days}
                hours={hours}
                minutes={minutes}
                onChange={handleTimeChange}
                error={errors.time}
            />

            {/* Recipient Address Input */}
            <div>
                <label className="block mb-2 text-gray-300 text-lg">Recipient Address</label>
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => {
                        setRecipientAddress(e.target.value);
                        if (errors.recipient) setErrors({ ...errors, recipient: null });
                    }}
                    className={`w-full p-4 bg-gray-900 border rounded-xl text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             ${errors.recipient ? 'border-red-500' : 'border-gray-700'}`}
                    placeholder="Enter recipient address"
                />
                {errors.recipient && (
                    <p className="mt-1 text-red-500 text-sm">{errors.recipient}</p>
                )}
            </div>

            {/* Error Message */}
            {errors.submit && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-500">{errors.submit}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white p-4 rounded-xl
                         flex items-center justify-center gap-2
                         ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
                         transition-all duration-200`}
            >
                {isLoading ? (
                    <span>Creating NFT...</span>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        <span>Create Time-Locked NFT</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default CreateForm;