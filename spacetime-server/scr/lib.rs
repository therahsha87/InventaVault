// SpacetimeDB imports
use spacetimedb::{table, reducer, ReducerContext, Identity, Table, Timestamp, ScheduleAt, SpacetimeType};
use std::time::Duration;

// ---------- Custom Types ----------

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum PatentStatus {
    Draft,
    Submitted,
    Examination,
    Granted,
    Rejected,
    Abandoned,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum DocType {
    Spec,
    Claims,
    Drawings,
    Abstract,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum DocGenStatus {
    NotStarted,
    InProgress,
    Completed,
    Failed,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum CollabStatus {
    Active,
    Closed,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum PortfolioRole {
    Owner,
    CoOwner,
    Licensee,
    Viewer,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum ConnectionStatus {
    Pending,
    Connected,
    Rejected,
    Blocked,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum AlertSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum TrendMetric {
    FilingCount,
    GrantCount,
    AlertCount,
    ActiveSessionCount,
}

#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub enum Stage {
    Idea,
    Drafting,
    PriorArt,
    Filing,
    Examination,
    OfficeAction,
    Appeal,
    Grant,
    Maintenance,
}

// ---------- Table Definitions ----------

#[table(name = inventor, public)]
#[derive(Clone)]
pub struct InventorProfile {
    #[primary_key]
    identity: Identity,
    name: String,
    email: String,
    affiliation: String,
    skills: String, // CSV tags for simplicity
    bio: String,
    created_at: Timestamp,
    updated_at: Timestamp,
}

#[table(name = patent_application, public)]
#[derive(Clone)]
pub struct PatentApplication {
    #[primary_key]
    #[auto_inc]
    application_id: u64,
    #[index(btree)]
    owner: Identity,
    title: String,
    abstract_text: String,
    claims_text: String,
    status: PatentStatus,
    created_at: Timestamp,
    last_updated: Timestamp,
}

#[table(name = prior_art_result, public)]
#[derive(Clone)]
pub struct PriorArtResult {
    #[primary_key]
    #[auto_inc]
    result_id: u64,
    #[index(btree)]
    application_id: u64,
    source: String,
    url: String,
    summary: String,
    relevance_score: f32,
    found_at: Timestamp,
}

#[table(name = document_generation, public)]
#[derive(Clone)]
pub struct DocumentGeneration {
    #[primary_key]
    #[auto_inc]
    doc_id: u64,
    #[index(btree)]
    application_id: u64,
    doc_type: DocType,
    status: DocGenStatus,
    error_message: String,
    updated_at: Timestamp,
}

#[table(name = blockchain_record, public)]
#[derive(Clone)]
pub struct BlockchainRecord {
    #[primary_key]
    #[auto_inc]
    record_id: u64,
    #[index(btree)]
    application_id: u64,
    tx_hash: String,
    network: String,
    recorded_at: Timestamp,
}

#[table(name = collab_session, public)]
#[derive(Clone)]
pub struct CollaborationSession {
    #[primary_key]
    #[auto_inc]
    session_id: u64,
    title: String,
    #[index(btree)]
    created_by: Identity,
    status: CollabStatus,
    started_at: Timestamp,
    ended_at: Timestamp,
    ended: bool,
}

#[table(name = collab_participant, public)]
#[derive(Clone)]
pub struct SessionParticipant {
    #[primary_key]
    #[auto_inc]
    row_id: u64,
    #[index(btree)]
    session_id: u64,
    #[index(btree)]
    participant: Identity,
    joined_at: Timestamp,
    active: bool,
}

#[table(name = portfolio_entry, public)]
#[derive(Clone)]
pub struct PatentPortfolioEntry {
    #[primary_key]
    #[auto_inc]
    entry_id: u64,
    #[index(btree)]
    owner: Identity,
    #[index(btree)]
    application_id: u64,
    role: PortfolioRole,
    added_at: Timestamp,
}

#[table(name = inventor_connection, public)]
#[derive(Clone)]
pub struct InventorConnection {
    #[primary_key]
    #[auto_inc]
    connection_id: u64,
    #[index(btree)]
    a: Identity,
    #[index(btree)]
    b: Identity,
    status: ConnectionStatus,
    created_at: Timestamp,
    updated_at: Timestamp,
}

#[table(name = infringement_alert, public)]
#[derive(Clone)]
pub struct InfringementAlert {
    #[primary_key]
    #[auto_inc]
    alert_id: u64,
    #[index(btree)]
    application_id: u64,
    alert_type: String,
    severity: AlertSeverity,
    description: String,
    detected_at: Timestamp,
    resolved: bool,
}

#[table(name = market_trend_snapshot, public)]
#[derive(Clone)]
pub struct MarketTrendSnapshot {
    #[primary_key]
    #[auto_inc]
    snapshot_id: u64,
    #[index(btree)]
    segment: String, // e.g., "global", "AI", "US", "IPC:G06F"
    metric: TrendMetric,
    value: f64,
    window: String, // e.g., "all_time", "24h", "7d", "30d"
    computed_at: Timestamp,
}

#[table(name = stage_progress, public)]
#[derive(Clone)]
pub struct StageProgress {
    #[primary_key]
    #[auto_inc]
    progress_id: u64,
    #[index(btree)]
    application_id: u64,
    stage: Stage,
    percent: u8,
    updated_at: Timestamp,
}

#[table(name = monitoring_schedule, public, scheduled(monitor_tick))]
#[derive(Clone)]
pub struct MonitoringSchedule {
    #[primary_key]
    #[auto_inc]
    scheduled_id: u64,
    scheduled_at: ScheduleAt,
}

#[table(name = analytics_schedule, public, scheduled(analytics_tick))]
#[derive(Clone)]
pub struct AnalyticsSchedule {
    #[primary_key]
    #[auto_inc]
    scheduled_id: u64,
    scheduled_at: ScheduleAt,
}

// ---------- Lifecycle Reducers ----------

#[reducer(init)]
pub fn init(ctx: &ReducerContext) -> Result<(), String> {
    spacetimedb::log::info!("Initializing Patent Ecosystem module...");

    if ctx.db.monitoring_schedule().count() == 0 {
        let schedule = MonitoringSchedule {
            scheduled_id: 0,
            scheduled_at: ScheduleAt::Interval(Duration::from_secs(60).into()),
        };
        match ctx.db.monitoring_schedule().try_insert(schedule) {
            Ok(row) => spacetimedb::log::info!("Monitoring scheduled with ID: {}", row.scheduled_id),
            Err(e) => spacetimedb::log::error!("Failed to schedule monitoring: {}", e),
        }
    }

    if ctx.db.analytics_schedule().count() == 0 {
        let schedule = AnalyticsSchedule {
            scheduled_id: 0,
            scheduled_at: ScheduleAt::Interval(Duration::from_secs(300).into()),
        };
        match ctx.db.analytics_schedule().try_insert(schedule) {
            Ok(row) => spacetimedb::log::info!("Analytics scheduled with ID: {}", row.scheduled_id),
            Err(e) => spacetimedb::log::error!("Failed to schedule analytics: {}", e),
        }
    }

    Ok(())
}

#[reducer(client_connected)]
pub fn identity_connected(ctx: &ReducerContext) {
    spacetimedb::log::info!("Client connected: {}", ctx.sender);
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    spacetimedb::log::info!("Client disconnected: {}", ctx.sender);
}

// ---------- Core Reducers ----------

#[reducer]
pub fn register_inventor(
    ctx: &ReducerContext,
    name: String,
    email: String,
    affiliation: String,
    skills: String,
    bio: String,
) -> Result<(), String> {
    let now = ctx.timestamp;
    if let Some(mut inv) = ctx.db.inventor().identity().find(&ctx.sender) {
        inv.name = name;
        inv.email = email;
        inv.affiliation = affiliation;
        inv.skills = skills;
        inv.bio = bio;
        inv.updated_at = now;
        ctx.db.inventor().identity().update(inv);
        Ok(())
    } else {
        let profile = InventorProfile {
            identity: ctx.sender,
            name,
            email,
            affiliation,
            skills,
            bio,
            created_at: now,
            updated_at: now,
        };
        ctx.db.inventor().insert(profile);
        Ok(())
    }
}

#[reducer]
pub fn submit_patent(
    ctx: &ReducerContext,
    title: String,
    abstract_text: String,
    claims_text: String,
) -> Result<(), String> {
    let now = ctx.timestamp;
    let row = PatentApplication {
        application_id: 0,
        owner: ctx.sender,
        title,
        abstract_text,
        claims_text,
        status: PatentStatus::Submitted,
        created_at: now,
        last_updated: now,
    };
    match ctx.db.patent_application().try_insert(row) {
        Ok(inserted) => {
            spacetimedb::log::info!("Patent submitted by {} app_id={}", inserted.owner, inserted.application_id);
            Ok(())
        }
        Err(e) => Err(format!("Failed to submit patent: {}", e)),
    }
}

#[reducer]
pub fn update_patent_status(
    ctx: &ReducerContext,
    application_id: u64,
    new_status: PatentStatus,
) -> Result<(), String> {
    if let Some(mut app) = ctx.db.patent_application().application_id().find(application_id) {
        if app.owner != ctx.sender {
            return Err("Only the owner can update patent status".into());
        }
        app.status = new_status.clone();
        app.last_updated = ctx.timestamp;
        let status_to_log = format!("{:?}", new_status);
        ctx.db.patent_application().application_id().update(app);
        spacetimedb::log::info!("Updated application {} status to {}", application_id, status_to_log);
        Ok(())
    } else {
        Err("Application not found".into())
    }
}

#[reducer]
pub fn add_prior_art_result(
    ctx: &ReducerContext,
    application_id: u64,
    source: String,
    url: String,
    summary: String,
    relevance_score: f32,
) -> Result<(), String> {
    let row = PriorArtResult {
        result_id: 0,
        application_id,
        source,
        url,
        summary,
        relevance_score,
        found_at: ctx.timestamp,
    };
    match ctx.db.prior_art_result().try_insert(row) {
        Ok(inserted) => {
            spacetimedb::log::info!("Prior art result recorded for app_id={} result_id={}", inserted.application_id, inserted.result_id);
            Ok(())
        }
        Err(e) => Err(format!("Failed to add prior art: {}", e)),
    }
}

#[reducer]
pub fn upsert_document_generation(
    ctx: &ReducerContext,
    application_id: u64,
    doc_type: DocType,
    status: DocGenStatus,
    error_message: String,
) -> Result<(), String> {
    // Try to find existing record for (application_id, doc_type)
    let mut existing_id: Option<u64> = None;
    for doc in ctx.db.document_generation().iter() {
        if doc.application_id == application_id && doc.doc_type == doc_type {
            existing_id = Some(doc.doc_id);
            break;
        }
    }

    if let Some(doc_id) = existing_id {
        if let Some(mut doc) = ctx.db.document_generation().doc_id().find(doc_id) {
            doc.status = status.clone();
            doc.error_message = error_message.clone();
            doc.updated_at = ctx.timestamp;
            let log_status = format!("{:?}", status);
            let log_type = format!("{:?}", doc_type);
            ctx.db.document_generation().doc_id().update(doc);
            spacetimedb::log::info!(
                "Updated doc generation app_id={} type={} status={}",
                application_id,
                log_type,
                log_status
            );
        }
    } else {
        let doc = DocumentGeneration {
            doc_id: 0,
            application_id,
            doc_type: doc_type.clone(),
            status: status.clone(),
            error_message: error_message.clone(),
            updated_at: ctx.timestamp,
        };
        ctx.db.document_generation().insert(doc);
        let log_status = format!("{:?}", status);
        let log_type = format!("{:?}", doc_type);
        spacetimedb::log::info!(
            "Inserted doc generation app_id={} type={} status={}",
            application_id,
            log_type,
            log_status
        );
    }
    Ok(())
}

#[reducer]
pub fn add_blockchain_record(
    ctx: &ReducerContext,
    application_id: u64,
    tx_hash: String,
    network: String,
) -> Result<(), String> {
    let rec = BlockchainRecord {
        record_id: 0,
        application_id,
        tx_hash,
        network,
        recorded_at: ctx.timestamp,
    };
    ctx.db.blockchain_record().insert(rec);
    Ok(())
}

#[reducer]
pub fn start_collab_session(ctx: &ReducerContext, title: String) -> Result<(), String> {
    let now = ctx.timestamp;
    let session = CollaborationSession {
        session_id: 0,
        title: title.clone(),
        created_by: ctx.sender,
        status: CollabStatus::Active,
        started_at: now,
        ended_at: now,
        ended: false,
    };
    let inserted = ctx.db.collab_session().insert(session);
    let sid = inserted.session_id;
    let participant = SessionParticipant {
        row_id: 0,
        session_id: sid,
        participant: ctx.sender,
        joined_at: now,
        active: true,
    };
    ctx.db.collab_participant().insert(participant);
    spacetimedb::log::info!("Collaboration session started id={} title={}", sid, title);
    Ok(())
}

#[reducer]
pub fn join_collab_session(ctx: &ReducerContext, session_id: u64) -> Result<(), String> {
    if let Some(sess) = ctx.db.collab_session().session_id().find(session_id) {
        if sess.status != CollabStatus::Active {
            return Err("Session is not active".into());
        }
        // Check if already participant
        for p in ctx.db.collab_participant().iter() {
            if p.session_id == session_id && p.participant == ctx.sender && p.active {
                return Ok(());
            }
        }
        let row = SessionParticipant {
            row_id: 0,
            session_id,
            participant: ctx.sender,
            joined_at: ctx.timestamp,
            active: true,
        };
        ctx.db.collab_participant().insert(row);
        Ok(())
    } else {
        Err("Session not found".into())
    }
}

#[reducer]
pub fn leave_collab_session(ctx: &ReducerContext, session_id: u64) -> Result<(), String> {
    // Mark participant inactive
    let mut to_update: Vec<u64> = Vec::new();
    for p in ctx.db.collab_participant().iter() {
        if p.session_id == session_id && p.participant == ctx.sender && p.active {
            to_update.push(p.row_id);
        }
    }
    for id in to_update {
        if let Some(mut row) = ctx.db.collab_participant().row_id().find(id) {
            row.active = false;
            ctx.db.collab_participant().row_id().update(row);
        }
    }
    Ok(())
}

#[reducer]
pub fn close_collab_session(ctx: &ReducerContext, session_id: u64) -> Result<(), String> {
    if let Some(mut sess) = ctx.db.collab_session().session_id().find(session_id) {
        if sess.created_by != ctx.sender {
            return Err("Only the creator can close the session".into());
        }
        sess.status = CollabStatus::Closed;
        sess.ended = true;
        sess.ended_at = ctx.timestamp;
        ctx.db.collab_session().session_id().update(sess);
        Ok(())
    } else {
        Err("Session not found".into())
    }
}

#[reducer]
pub fn add_to_portfolio(
    ctx: &ReducerContext,
    application_id: u64,
    role: PortfolioRole,
) -> Result<(), String> {
    // Avoid duplicates (owner+application_id+role)
    for e in ctx.db.portfolio_entry().iter() {
        if e.owner == ctx.sender && e.application_id == application_id && e.role == role {
            return Ok(());
        }
    }
    let row = PatentPortfolioEntry {
        entry_id: 0,
        owner: ctx.sender,
        application_id,
        role: role.clone(),
        added_at: ctx.timestamp,
    };
    ctx.db.portfolio_entry().insert(row);
    Ok(())
}

#[reducer]
pub fn connect_inventor(ctx: &ReducerContext, target: Identity) -> Result<(), String> {
    if target == ctx.sender {
        return Err("Cannot connect to self".into());
    }
    // Prevent duplicates in either direction while pending/connected
    for c in ctx.db.inventor_connection().iter() {
        let pair = (c.a == ctx.sender && c.b == target) || (c.a == target && c.b == ctx.sender);
        if pair && (c.status == ConnectionStatus::Pending || c.status == ConnectionStatus::Connected) {
            return Ok(());
        }
    }
    let row = InventorConnection {
        connection_id: 0,
        a: ctx.sender,
        b: target,
        status: ConnectionStatus::Pending,
        created_at: ctx.timestamp,
        updated_at: ctx.timestamp,
    };
    ctx.db.inventor_connection().insert(row);
    Ok(())
}

#[reducer]
pub fn respond_connection(ctx: &ReducerContext, connection_id: u64, accept: bool) -> Result<(), String> {
    if let Some(mut conn) = ctx.db.inventor_connection().connection_id().find(connection_id) {
        if conn.b != ctx.sender && conn.a != ctx.sender {
            return Err("Not authorized to respond to this connection".into());
        }
        conn.status = if accept { ConnectionStatus::Connected } else { ConnectionStatus::Rejected };
        conn.updated_at = ctx.timestamp;
        let status_log = format!("{:?}", conn.status);
        ctx.db.inventor_connection().connection_id().update(conn);
        spacetimedb::log::info!("Connection {} updated to {}", connection_id, status_log);
        Ok(())
    } else {
        Err("Connection not found".into())
    }
}

#[reducer]
pub fn update_stage_progress(
    ctx: &ReducerContext,
    application_id: u64,
    stage: Stage,
    percent: u8,
) -> Result<(), String> {
    // Upsert StageProgress per (application_id, stage)
    let mut existing_id: Option<u64> = None;
    for sp in ctx.db.stage_progress().iter() {
        if sp.application_id == application_id && sp.stage == stage {
            existing_id = Some(sp.progress_id);
            break;
        }
    }
    if let Some(pid) = existing_id {
        if let Some(mut row) = ctx.db.stage_progress().progress_id().find(pid) {
            row.percent = percent;
            row.updated_at = ctx.timestamp;
            ctx.db.stage_progress().progress_id().update(row);
        }
    } else {
        let row = StageProgress {
            progress_id: 0,
            application_id,
            stage: stage.clone(),
            percent,
            updated_at: ctx.timestamp,
        };
        ctx.db.stage_progress().insert(row);
    }

    // Touch application last_updated if exists
    if let Some(mut app) = ctx.db.patent_application().application_id().find(application_id) {
        app.last_updated = ctx.timestamp;
        ctx.db.patent_application().application_id().update(app);
    }

    Ok(())
}

#[reducer]
pub fn resolve_alert(ctx: &ReducerContext, alert_id: u64) -> Result<(), String> {
    if let Some(mut alert) = ctx.db.infringement_alert().alert_id().find(alert_id) {
        alert.resolved = true;
        ctx.db.infringement_alert().alert_id().update(alert);
        Ok(())
    } else {
        Err("Alert not found".into())
    }
}

// ---------- Scheduled Reducers ----------

#[reducer]
pub fn monitor_tick(ctx: &ReducerContext, _info: MonitoringSchedule) -> Result<(), String> {
    // Security: only scheduler triggers this reducer
    if ctx.sender != ctx.identity() {
        return Err("Reducer 'monitor_tick' may only be invoked by scheduling.".into());
    }

    // Simple automated monitoring demo: ensure each Submitted/Examination app has a heartbeat alert once
    for app in ctx.db.patent_application().iter() {
        if app.status == PatentStatus::Submitted || app.status == PatentStatus::Examination {
            let mut has_heartbeat = false;
            for a in ctx.db.infringement_alert().iter() {
                if a.application_id == app.application_id && a.alert_type == "monitor_heartbeat" {
                    has_heartbeat = true;
                    break;
                }
            }
            if !has_heartbeat {
                let alert = InfringementAlert {
                    alert_id: 0,
                    application_id: app.application_id,
                    alert_type: "monitor_heartbeat".to_string(),
                    severity: AlertSeverity::Low,
                    description: "Automated monitoring check executed".to_string(),
                    detected_at: ctx.timestamp,
                    resolved: true,
                };
                ctx.db.infringement_alert().insert(alert);
            }
        }
    }

    spacetimedb::log::debug!("monitor_tick completed");
    Ok(())
}

#[reducer]
pub fn analytics_tick(ctx: &ReducerContext, _info: AnalyticsSchedule) -> Result<(), String> {
    // Security: only scheduler triggers this reducer
    if ctx.sender != ctx.identity() {
        return Err("Reducer 'analytics_tick' may only be invoked by scheduling.".into());
    }

    // Compute simple global aggregates
    let mut total_apps: u64 = 0;
    let mut granted_apps: u64 = 0;
    for app in ctx.db.patent_application().iter() {
        total_apps += 1;
        if app.status == PatentStatus::Granted {
            granted_apps += 1;
        }
    }

    let mut active_sessions: u64 = 0;
    for s in ctx.db.collab_session().iter() {
        if s.status == CollabStatus::Active {
            active_sessions += 1;
        }
    }

    let mut unresolved_alerts: u64 = 0;
    for a in ctx.db.infringement_alert().iter() {
        if !a.resolved {
            unresolved_alerts += 1;
        }
    }

    let now = ctx.timestamp;

    // Insert snapshots
    ctx.db.market_trend_snapshot().insert(MarketTrendSnapshot {
        snapshot_id: 0,
        segment: "global".to_string(),
        metric: TrendMetric::FilingCount,
        value: total_apps as f64,
        window: "all_time".to_string(),
        computed_at: now,
    });

    ctx.db.market_trend_snapshot().insert(MarketTrendSnapshot {
        snapshot_id: 0,
        segment: "global".to_string(),
        metric: TrendMetric::GrantCount,
        value: granted_apps as f64,
        window: "all_time".to_string(),
        computed_at: now,
    });

    ctx.db.market_trend_snapshot().insert(MarketTrendSnapshot {
        snapshot_id: 0,
        segment: "global".to_string(),
        metric: TrendMetric::ActiveSessionCount,
        value: active_sessions as f64,
        window: "current".to_string(),
        computed_at: now,
    });

    ctx.db.market_trend_snapshot().insert(MarketTrendSnapshot {
        snapshot_id: 0,
        segment: "global".to_string(),
        metric: TrendMetric::AlertCount,
        value: unresolved_alerts as f64,
        window: "current".to_string(),
        computed_at: now,
    });

    spacetimedb::log::debug!("analytics_tick completed");
    Ok(())
}
