import type { Request, Response } from 'express';
import Draft from '../models/draft.js';

/**
 * Save a draft
 * POST /api/drafts
 */
export const saveDraft = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            senderId,
            senderName,
            senderEmail,
            recipientName,
            recipientEmail,
            department,
            batch,
            recipients, // New: array of recipients
            title,
            content,
            eventName,
            eventDate,
            eventLocation,
        } = req.body;

        if (!senderId || !senderName || !senderEmail) {
            res.status(400).json({
                success: false,
                message: 'Sender information is required'
            });
            return;
        }

        const draft = new Draft({
            senderId,
            senderName,
            senderEmail,
            // Store multiple recipients if provided
            recipients: recipients || [],
            // Legacy single recipient fields (for backward compatibility)
            recipientName: recipientName || '',
            recipientEmail: recipientEmail || '',
            department: department || '',
            batch: batch || '',
            title: title || '',
            content: content || '',
            eventName: eventName || '',
            eventDate: eventDate || '',
            eventLocation: eventLocation || '',
        });

        await draft.save();

        res.status(201).json({
            success: true,
            message: 'Draft saved successfully',
            draft
        });

    } catch (error: any) {
        console.error('Error saving draft:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save draft',
            error: error.message
        });
    }
};

/**
 * Update an existing draft
 * PUT /api/drafts/:draftId
 */
export const updateDraft = async (req: Request, res: Response): Promise<void> => {
    try {
        const { draftId } = req.params;
        const updateData = req.body;

        const draft = await Draft.findByIdAndUpdate(
            draftId,
            { ...updateData, updatedAt: new Date() },
            { returnDocument: 'after' }
        );

        if (!draft) {
            res.status(404).json({
                success: false,
                message: 'Draft not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Draft updated successfully',
            draft
        });

    } catch (error: any) {
        console.error('Error updating draft:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update draft',
            error: error.message
        });
    }
};

/**
 * Get all drafts
 * GET /api/drafts/all
 */
export const getAllDrafts = async (req: Request, res: Response): Promise<void> => {
    try {
        const drafts = await Draft.find({})
            .sort({ updatedAt: -1 })
            .select('senderId senderName recipientName recipientEmail recipients title content updatedAt');

        res.status(200).json({
            success: true,
            drafts,
            total: drafts.length
        });

    } catch (error: any) {
        console.error('Error fetching drafts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch drafts',
            error: error.message
        });
    }
};

/**
 * Get a draft by ID
 * GET /api/drafts/:draftId
 */
export const getDraftById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { draftId } = req.params;

        const draft = await Draft.findById(draftId);

        if (!draft) {
            res.status(404).json({
                success: false,
                message: 'Draft not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            draft
        });

    } catch (error: any) {
        console.error('Error fetching draft:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch draft',
            error: error.message
        });
    }
};

/**
 * Delete a draft
 * DELETE /api/drafts/:draftId
 */
export const deleteDraft = async (req: Request, res: Response): Promise<void> => {
    try {
        const { draftId } = req.params;

        const draft = await Draft.findByIdAndDelete(draftId);

        if (!draft) {
            res.status(404).json({
                success: false,
                message: 'Draft not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Draft deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting draft:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete draft',
            error: error.message
        });
    }
};

/**
 * Get draft count
 * GET /api/drafts/count
 */
export const getDraftCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const count = await Draft.countDocuments({});

        res.status(200).json({
            success: true,
            count
        });

    } catch (error: any) {
        console.error('Error counting drafts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to count drafts',
            error: error.message
        });
    }
};
