CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_institution_member(_user_id uuid, _institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (SELECT 1 FROM public.institution_members WHERE user_id = _user_id AND institution_id = _institution_id AND active)
$$;
REVOKE ALL ON FUNCTION private.is_institution_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_institution_member(uuid, uuid) TO authenticated, service_role;

DROP POLICY "Users can read own roles" ON public.user_roles;
DROP POLICY "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Authenticated users read institutions" ON public.institutions;
DROP POLICY "Admins manage institutions" ON public.institutions;
CREATE POLICY "Authenticated users read institutions" ON public.institutions FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin') OR private.is_institution_member(auth.uid(), id));
CREATE POLICY "Admins manage institutions" ON public.institutions FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Members read own membership" ON public.institution_members;
DROP POLICY "Admins manage memberships" ON public.institution_members;
CREATE POLICY "Members read own membership" ON public.institution_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage memberships" ON public.institution_members FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Institution users read students" ON public.students;
DROP POLICY "Institution users create students" ON public.students;
DROP POLICY "Institution users update students" ON public.students;
DROP POLICY "Admins delete students" ON public.students;
CREATE POLICY "Institution users read students" ON public.students FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin') OR private.is_institution_member(auth.uid(), institution_id));
CREATE POLICY "Institution users create students" ON public.students FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND private.is_institution_member(auth.uid(), institution_id))));
CREATE POLICY "Institution users update students" ON public.students FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND private.is_institution_member(auth.uid(), institution_id))) WITH CHECK (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND private.is_institution_member(auth.uid(), institution_id)));
CREATE POLICY "Admins delete students" ON public.students FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Institution users read results" ON public.results;
DROP POLICY "DMS creates draft results" ON public.results;
DROP POLICY "Institution users update results" ON public.results;
DROP POLICY "Admins delete results" ON public.results;
CREATE POLICY "Institution users read results" ON public.results FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin') OR private.is_institution_member(auth.uid(), institution_id));
CREATE POLICY "DMS creates draft results" ON public.results FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND status = 'draft' AND (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND private.is_institution_member(auth.uid(), institution_id))));
CREATE POLICY "Institution users update results" ON public.results FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND private.is_institution_member(auth.uid(), institution_id) AND status IN ('draft', 'submitted'))) WITH CHECK (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND private.is_institution_member(auth.uid(), institution_id) AND status IN ('draft', 'submitted')));
CREATE POLICY "Admins delete results" ON public.results FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Institution users read tags" ON public.certificate_tags;
DROP POLICY "Institution users create tags" ON public.certificate_tags;
DROP POLICY "Institution users update tags" ON public.certificate_tags;
DROP POLICY "Admins delete tags" ON public.certificate_tags;
CREATE POLICY "Institution users read tags" ON public.certificate_tags FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND private.is_institution_member(auth.uid(), r.institution_id)));
CREATE POLICY "Institution users create tags" ON public.certificate_tags FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND r.status = 'issued' AND private.is_institution_member(auth.uid(), r.institution_id)))));
CREATE POLICY "Institution users update tags" ON public.certificate_tags FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND private.is_institution_member(auth.uid(), r.institution_id)))) WITH CHECK (private.has_role(auth.uid(), 'admin') OR (private.has_role(auth.uid(), 'dms') AND EXISTS (SELECT 1 FROM public.results r WHERE r.id = result_id AND private.is_institution_member(auth.uid(), r.institution_id))));
CREATE POLICY "Admins delete tags" ON public.certificate_tags FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Institution users read tag events" ON public.tag_events;
DROP POLICY "Institution users append tag events" ON public.tag_events;
CREATE POLICY "Institution users read tag events" ON public.tag_events FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.certificate_tags t JOIN public.results r ON r.id = t.result_id WHERE t.id = tag_id AND private.is_institution_member(auth.uid(), r.institution_id)));
CREATE POLICY "Institution users append tag events" ON public.tag_events FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() AND (private.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.certificate_tags t JOIN public.results r ON r.id = t.result_id WHERE t.id = tag_id AND private.has_role(auth.uid(), 'dms') AND private.is_institution_member(auth.uid(), r.institution_id))));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_institution_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC, anon, authenticated;
DROP FUNCTION public.has_role(uuid, public.app_role);
DROP FUNCTION public.is_institution_member(uuid, uuid);
DROP FUNCTION public.bootstrap_first_admin();
DROP FUNCTION public.verify_certificate(text);