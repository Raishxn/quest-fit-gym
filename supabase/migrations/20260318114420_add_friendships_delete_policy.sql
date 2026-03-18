
-- Allow users to delete friendships they are part of (unfriend / cancel request)
CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);
