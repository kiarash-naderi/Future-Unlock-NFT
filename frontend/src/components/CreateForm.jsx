import React, { useState } from 'react';
import TimeInput from './TimeInput';
import { Send } from 'lucide-react';
import { validateFormData, createTimeLockNFT } from '../services/nftService';

const CreateForm = ({ selectedNFT, onSubmit }) => {
    const [formData, setFormData] = useState({
        message: '',
        days: 0,
        hours: 0,
        minutes: 0,
        recipient: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleTimeChange = ({ days, hours, minutes }) => {
        setFormData(prev => ({ ...prev, days, hours, minutes }));
        if (errors.time) {
            setErrors(prev => ({ ...prev, time: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // اعتبارسنجی فرم
        const validation = validateFormData(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsLoading(true);
        try {
            const result = await createTimeLockNFT(formData);
            if (result.success) {
                onSubmit({
                    ...formData,
                    selectedNFT,
                    transactionHash: result.transactionHash
                });
            } else {
                setErrors({ submit: result.error });
            }
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl space-y-6">
            {/* Message Input */}
            <div>
                <label className="block mb-2 text-gray-300 text-lg">Message</label>
                <textarea
                    value={formData.message}
                    onChange={(e) => {
                        setFormData({...formData, message: e.target.value});
                        if (errors.message) setErrors({...errors, message: null});
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
                days={formData.days}
                hours={formData.hours}
                minutes={formData.minutes}
                onChange={handleTimeChange}
                error={errors.time}
            />

            {/* Recipient Input */}
            <div>
                <label className="block mb-2 text-gray-300 text-lg">Recipient Address</label>
                <input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => {
                        setFormData({...formData, recipient: e.target.value});
                        if (errors.recipient) setErrors({...errors, recipient: null});
                    }}
                    className={`w-full p-4 bg-gray-900 border rounded-xl text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             ${errors.recipient ? 'border-red-500' : 'border-gray-700'}`}
                    placeholder="Enter wallet address"
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
                onClick={handleSubmit}
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
        </div>
    );
};

export default CreateForm;