-- Create artists table that references sellers
CREATE TABLE IF NOT EXISTS public.artists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  bio text,
  region text,
  avatar_url text,
  specialties text[],
  social_links jsonb DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(seller_id)
);

-- Enable RLS
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Sellers can create their artist profile" ON public.artists FOR INSERT WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can update their own artist profile" ON public.artists FOR UPDATE USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_artists_seller_id ON public.artists(seller_id);
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id);

-- Trigger to automatically create artist when seller is approved
CREATE OR REPLACE FUNCTION public.create_artist_on_seller_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_status = 'approved' AND (OLD.onboarding_status IS NULL OR OLD.onboarding_status != 'approved') THEN
    INSERT INTO public.artists (seller_id, user_id, display_name, bio, region)
    VALUES (NEW.id, NEW.user_id, NEW.display_name, NEW.bio, NEW.region)
    ON CONFLICT (seller_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_artist_on_approval
  AFTER UPDATE ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_artist_on_seller_approval();

-- Also create artist for sellers that are already approved
INSERT INTO public.artists (seller_id, user_id, display_name, bio, region)
SELECT id, user_id, display_name, bio, region 
FROM public.sellers 
WHERE onboarding_status = 'approved'
ON CONFLICT (seller_id) DO NOTHING;
