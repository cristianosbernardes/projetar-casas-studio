-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Start with a broad insert policy for system logic (or use service role in edge functions)
-- For client-side inserts (e.g. requesting something), allow authenticated
CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow users to mark as read (update)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
