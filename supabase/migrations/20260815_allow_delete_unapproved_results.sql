-- Drop existing delete policy for results if it exists
DROP POLICY IF EXISTS "DMS users can delete their draft results" ON results;
DROP POLICY IF EXISTS "DMS users can delete their unapproved results" ON results;

-- Allow DMS to delete results that are not issued and not approved
CREATE POLICY "DMS users can delete their unapproved results" ON results
  FOR DELETE TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM institution_members WHERE user_id = auth.uid() AND active = true
    )
    AND status != 'issued'
    AND status != 'approved'
  );
