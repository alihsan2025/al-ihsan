-- Add missing fields to volunteer applications
ALTER TABLE public.volunteer_applications
ADD COLUMN date_of_birth DATE,
ADD COLUMN emergency_contact_relationship TEXT,
ADD COLUMN available_for_outreach BOOLEAN DEFAULT false;
