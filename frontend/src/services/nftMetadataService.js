import axios from 'axios';
import { getUnlockTimestamp } from '../utils/timeUtils';

class NFTMetadataService {
    constructor() {
        this.pinataEndpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
        this.jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZWYyZDI4Zi1hYWUyLTRmNzQtOTk1ZC1lNDUxMjlkMmM5OTEiLCJlbWFpbCI6ImtpYXJhc2huYWFkZXJpd29ya0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZDgyNDEzNTc0YWMyZmIzYzc4NzgiLCJzY29wZWRLZXlTZWNyZXQiOiI3ZGNmNGY3N2ZiMmI1YmExNjRkNjU5MzJjMzIwODQ2ZDUzOTE1MjhiYTllMjIyNWFhZGZmYThmZDdlYzY1NmQ3IiwiZXhwIjoxNzY1MDE0NjEyfQ.LW7YudZTAz0491mOqUvU4N50QFltmypGUkjlOPzq9aY';
    }

    async getMetadata(metadataUrl) {
        try {
            const ipfsHash = metadataUrl.replace('ipfs://', '');
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
        }
    }

    async uploadMetadata(formData, templateId, nftTemplates) {
        try {
            const template = nftTemplates.find(t => t.id === parseInt(templateId));
            const ipfsHash = template.image.split('/').pop();
            const ipfsImageUrl = `ipfs://${ipfsHash}`;

            // Calculate unlock timestamp using the same method as the contract
            const unlockTimestamp = getUnlockTimestamp(
                formData.days || formData.lockDays || 0,
                formData.hours || formData.lockHours || 0,
                formData.minutes || formData.lockMinutes || 0
            );

            // Convert to milliseconds for JavaScript Date
            const unlockDate = new Date(unlockTimestamp * 1000);

            console.log('Metadata unlock time calculation:', {
                formData,
                calculatedTimestamp: unlockTimestamp,
                unlockDate: unlockDate.toLocaleString(),
                dateValid: !isNaN(unlockDate.getTime())
            });

            const baseMetadata = {
                name: "TimeLockedNFT",
                description: `🔒 Visit our website to view this special message after ${unlockDate.toLocaleString()}`,
                image: ipfsImageUrl,
                external_url: template.image,
                background_color: "FFFFFF",
                attributes: [
                    {
                        trait_type: "Type",
                        value: template.mediaType
                    },
                    {
                        trait_type: "Unlock Date",
                        value: unlockDate.toLocaleString()
                    }
                ],
                properties: {
                    unlockTime: unlockTimestamp * 1000, // Store as milliseconds for JavaScript compatibility
                    files: [
                        {
                            uri: ipfsImageUrl,
                            type: "image"
                        }
                    ]
                }
            };

            console.log('Uploading metadata:', baseMetadata);

            const response = await axios.post(
                this.pinataEndpoint,
                baseMetadata,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.jwt}`
                    }
                }
            );

            return `ipfs://${response.data.IpfsHash}`;
        } catch (error) {
            console.error('Error uploading metadata:', error);
            throw new Error(`Failed to upload metadata: ${error.message}`);
        }
    }
}

export const nftMetadataService = new NFTMetadataService();