import { supabase } from './supabase';
import { callEdgeFunction } from './edgeFunctions';

export type VolunteerApplicationStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'SHORTLISTED'
  | 'DECLINED';

export interface VolunteerApplicationInput {
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string;
  occupation: string;
  maritalStatus: string;
  preferredRole: string;
  availability: string;
  mosqueCommunity: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  experience: string;
  motivation: string;
  idDocumentUrl?: string;
  qAmanah: string;
  qConfidentiality: string;
  qAdab: string;
  scenarioResponse: string;
  availableForOutreach: boolean;
  quizScore: number;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedConfidentiality: boolean;
}

export interface VolunteerApplicationRecord extends VolunteerApplicationInput {
  id: string;
  status: VolunteerApplicationStatus;
  createdAt: string;
}

export const submitVolunteerApplication = async (
  application: VolunteerApplicationInput
) => {
  const { error } = await supabase.from('volunteer_applications').insert({
    full_name: application.fullName,
    date_of_birth: application.dateOfBirth,
    age: application.age,
    gender: application.gender,
    phone: application.phone,
    email: application.email,
    city: application.city,
    state: application.state,
    address: application.address,
    occupation: application.occupation,
    marital_status: application.maritalStatus,
    preferred_role: application.preferredRole,
    availability: application.availability,
    mosque_community: application.mosqueCommunity,
    emergency_contact_name: application.emergencyContactName,
    emergency_contact_phone: application.emergencyContactPhone,
    emergency_contact_relationship: application.emergencyContactRelationship,
    experience: application.experience,
    motivation: application.motivation,
    id_document_url: application.idDocumentUrl || null,
    q_amanah: application.qAmanah,
    q_confidentiality: application.qConfidentiality,
    q_adab: application.qAdab,
    scenario_response: application.scenarioResponse,
    available_for_outreach: application.availableForOutreach,
    quiz_score: application.quizScore,
    accepted_terms: application.acceptedTerms,
    accepted_privacy: application.acceptedPrivacy,
    accepted_confidentiality: application.acceptedConfidentiality,
    status: 'PENDING',
  });

  if (error) throw error;

  // Fire-and-forget email notification
  callEdgeFunction('notify-application', {
    type: 'volunteer',
    record: {
      full_name: application.fullName,
      age: application.age,
      gender: application.gender,
      phone: application.phone,
      email: application.email,
      city: application.city,
      state: application.state,
      preferred_role: application.preferredRole,
      quiz_score: application.quizScore,
    },
  });
};

export const getVolunteerApplications = async (): Promise<
  VolunteerApplicationRecord[]
> => {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    age: row.age,
    gender: row.gender,
    phone: row.phone,
    email: row.email,
    city: row.city,
    state: row.state,
    address: row.address,
    occupation: row.occupation,
    maritalStatus: row.marital_status,
    preferredRole: row.preferred_role,
    availability: row.availability,
    mosqueCommunity: row.mosque_community,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    emergencyContactRelationship: row.emergency_contact_relationship,
    experience: row.experience,
    motivation: row.motivation,
    idDocumentUrl: row.id_document_url ?? undefined,
    qAmanah: row.q_amanah,
    qConfidentiality: row.q_confidentiality,
    qAdab: row.q_adab,
    scenarioResponse: row.scenario_response,
    availableForOutreach: row.available_for_outreach,
    quizScore: row.quiz_score,
    acceptedTerms: row.accepted_terms,
    acceptedPrivacy: row.accepted_privacy,
    acceptedConfidentiality: row.accepted_confidentiality,
    status: row.status as VolunteerApplicationStatus,
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
};

export const updateVolunteerApplicationStatus = async (
  id: string,
  status: VolunteerApplicationStatus
) => {
  const { data: record, error: fetchError } = await supabase
    .from('volunteer_applications')
    .select('full_name, email')
    .eq('id', id)
    .single();

  if (fetchError || !record) {
    throw new Error('Failed to find applicant record to update status.');
  }

  const { error } = await supabase
    .from('volunteer_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  callEdgeFunction('notify-status-update', {
    type: 'volunteer',
    id,
    applicantName: record.full_name || 'Volunteer',
    applicantEmail: record.email,
    newStatus: status,
  });
};

export const deleteVolunteerApplication = async (id: string): Promise<void> => {
  const { error } = await supabase.from('volunteer_applications').delete().eq('id', id);
  if (error) throw error;
};
