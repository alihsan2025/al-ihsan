import { supabase } from './supabase';
import { callEdgeFunction } from './edgeFunctions';

export type AidApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED';

export interface AidApplicationInput {
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
  description: string;
  situationDetails: string;
  photoUrls: string[];
  videoUrl: string;
  referralSource: string;
}

export interface AidApplicationRecord extends AidApplicationInput {
  id: string;
  status: AidApplicationStatus;
  createdAt: string;
}

export const submitAidApplication = async (
  application: AidApplicationInput
) => {
  const { error } = await supabase.from('aid_applications').insert({
    full_name: application.fullName,
    phone: application.phone,
    email: application.email,
    address: application.address,
    city: application.city,
    state: application.state,
    aid_category: application.aidCategory,
    household_size: application.householdSize,
    monthly_income: application.monthlyIncome,
    amount_needed: application.amountNeeded,
    description: application.description,
    situation_details: application.situationDetails,
    photo_urls: application.photoUrls,
    video_url: application.videoUrl,
    referral_source: application.referralSource,
    status: 'PENDING',
  });

  if (error) throw error;

  // Fire-and-forget email notification
  callEdgeFunction('notify-application', {
    type: 'aid',
    record: {
      full_name: application.fullName,
      phone: application.phone,
      email: application.email,
      city: application.city,
      state: application.state,
      aid_category: application.aidCategory,
      household_size: application.householdSize,
      monthly_income: application.monthlyIncome,
      amount_needed: application.amountNeeded,
      description: application.description,
    },
  });
};

export const getAidApplications = async (): Promise<
  AidApplicationRecord[]
> => {
  const { data, error } = await supabase
    .from('aid_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    state: row.state,
    aidCategory: row.aid_category,
    householdSize: row.household_size,
    monthlyIncome: row.monthly_income,
    amountNeeded: row.amount_needed ?? '',
    description: row.description,
    situationDetails: row.situation_details ?? '',
    photoUrls: row.photo_urls ?? [],
    videoUrl: row.video_url ?? '',
    referralSource: row.referral_source,
    status: row.status as AidApplicationStatus,
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
};

export const updateAidApplicationStatus = async (
  id: string,
  status: AidApplicationStatus
) => {
  const { data: record, error: fetchError } = await supabase
    .from('aid_applications')
    .select('full_name, email, aid_category')
    .eq('id', id)
    .single();

  if (fetchError || !record) {
    throw new Error('Failed to find applicant record to update status.');
  }

  const { error } = await supabase
    .from('aid_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  callEdgeFunction('notify-status-update', {
    type: 'aid',
    id,
    applicantName: record.full_name || 'Applicant',
    applicantEmail: record.email,
    newStatus: status,
    category: record.aid_category,
  });
};

export const deleteAidApplication = async (id: string): Promise<void> => {
  const { error } = await supabase.from('aid_applications').delete().eq('id', id);
  if (error) throw error;
};
