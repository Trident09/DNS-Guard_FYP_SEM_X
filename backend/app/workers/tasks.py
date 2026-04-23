from app.celery_app import celery_app


@celery_app.task(name="tasks.run_full_analysis")
def run_full_analysis(domain: str):
    """Async deep analysis task (passive DNS, threat feeds, etc.)"""
    # TODO: implement full async pipeline
    return {"domain": domain, "status": "queued"}
