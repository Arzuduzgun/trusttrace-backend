-->Veritabanına bir kural koyar: moderation_events tablosunda UPDATE, DELETE ya da TRUNCATE (tabloyu topluca boşaltma) denenirse Postgres hata fırlatır ve işlemi yapmaz.
-->Bu kural kodun değil, veritabanının bir parçası. Migration olarak yazınca projeyi kuran herkesin veritabanına otomatik eklenir. Deploy günü de canlı veritabanına aynı şekilde gider.
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