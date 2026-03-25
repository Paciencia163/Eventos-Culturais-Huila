
-- Create storage bucket for event documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-documents', 'event-documents', true);

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-documents');

-- Allow anyone to view/download documents (public bucket)
CREATE POLICY "Anyone can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-documents');

-- Allow users to delete their own uploaded documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
