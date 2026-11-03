CREATE OR REPLACE FUNCTION forbid_moderation_event_changes() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'moderation_events is append-only: % is not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER moderation_events_no_update_delete
BEFORE UPDATE OR DELETE ON moderation_events
FOR EACH ROW EXECUTE FUNCTION forbid_moderation_event_changes();
--> statement-breakpoint
CREATE TRIGGER moderation_events_no_truncate
BEFORE TRUNCATE ON moderation_events
FOR EACH STATEMENT EXECUTE FUNCTION forbid_moderation_event_changes();