
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE POLICY "Trainer images are readable" ON storage.objects FOR SELECT
  USING (bucket_id = 'trainer-images');
CREATE POLICY "Users can upload own trainer image" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trainer-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own trainer image" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'trainer-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own trainer image" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'trainer-images' AND (storage.foldername(name))[1] = auth.uid()::text);
