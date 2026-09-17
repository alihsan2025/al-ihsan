import { supabase } from './supabase';

// Case management now uses aid_applications table with is_case=true
export type CaseStatus = 'PENDING' | 'APPROVED' | 'FUNDRAISING' | 'COMPLETED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type Priority = 'URGENT' | 'NORMAL';

export interface CaseRecord {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    aidCategory: string;
    householdSize: number;
    monthlyIncome: string;
    amountNeeded: string;
    amountRaised: number;
    description: string;
    situationDetails: string;
    story: string;
    photoUrls: string[];
    videoUrl: string;
    documents: string[];
    referralSource: string;
    status: string;
    isCase: boolean;
    verificationStatus: VerificationStatus;
    caseStatus: CaseStatus;
    priority: Priority;
    assignedTo: string | null;
    internalNotes: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface TimelineEvent {
    id: string;
    caseId: string;
    eventType: string;
    description: string;
    createdBy: string | null;
    createdAt: string;
}

const mapRow = (row: any): CaseRecord => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email ?? '',
    address: row.address,
    city: row.city,
    state: row.state,
    aidCategory: row.aid_category,
    householdSize: row.household_size ?? 1,
    monthlyIncome: row.monthly_income ?? '',
    amountNeeded: row.amount_needed ?? '0',
    amountRaised: row.amount_raised ?? 0,
    description: row.description,
    situationDetails: row.situation_details ?? '',
    story: row.story ?? '',
    photoUrls: row.photo_urls ?? [],
    videoUrl: row.video_url ?? '',
    documents: row.documents ?? [],
    referralSource: row.referral_source ?? '',
    status: row.status,
    isCase: row.is_case ?? false,
    verificationStatus: row.verification_status ?? 'PENDING',
    caseStatus: row.case_status ?? 'PENDING',
    priority: row.priority ?? 'NORMAL',
    assignedTo: row.assigned_to ?? null,
    internalNotes: row.internal_notes ?? '',
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? null,
});

export const getCases = async (): Promise<CaseRecord[]> => {
    const { data, error } = await supabase
        .from('aid_applications')
        .select('*')
        .eq('is_case', true)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
};

export const promoteToCase = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('aid_applications')
        .update({
            is_case: true,
            case_status: 'APPROVED',
            verification_status: 'VERIFIED',
            status: 'APPROVED',
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    if (error) throw error;

    await addTimelineEvent(id, 'PROMOTED', 'Request promoted to active case');
};

export const updateCaseFields = async (id: string, fields: Partial<{
    caseStatus: CaseStatus;
    verificationStatus: VerificationStatus;
    priority: Priority;
    assignedTo: string | null;
    internalNotes: string;
    story: string;
    amountRaised: number;
}>): Promise<void> => {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (fields.caseStatus !== undefined) updateData.case_status = fields.caseStatus;
    if (fields.verificationStatus !== undefined) updateData.verification_status = fields.verificationStatus;
    if (fields.priority !== undefined) updateData.priority = fields.priority;
    if (fields.assignedTo !== undefined) updateData.assigned_to = fields.assignedTo;
    if (fields.internalNotes !== undefined) updateData.internal_notes = fields.internalNotes;
    if (fields.story !== undefined) updateData.story = fields.story;
    if (fields.amountRaised !== undefined) updateData.amount_raised = fields.amountRaised;

    const { error } = await supabase.from('aid_applications').update(updateData).eq('id', id);
    if (error) throw error;
};

export const addTimelineEvent = async (caseId: string, eventType: string, description: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('case_timeline').insert({
        case_id: caseId,
        event_type: eventType,
        description,
        created_by: user?.id ?? null,
    });
    if (error) console.error('Failed to add timeline event:', error);
};

export const getTimeline = async (caseId: string): Promise<TimelineEvent[]> => {
    const { data, error } = await supabase
        .from('case_timeline')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(row => ({
        id: row.id,
        caseId: row.case_id,
        eventType: row.event_type,
        description: row.description ?? '',
        createdBy: row.created_by,
        createdAt: row.created_at,
    }));
};
