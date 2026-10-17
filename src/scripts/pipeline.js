/**
 * MCP Agent & Tool Orchestration Pipeline Interactivity.
 * Handles interactive stage switching, telemetry updates, and keyboard control.
 */
export function initPipeline() {
  const artifact = document.querySelector('.hero__mcp-artifact');
  if (!artifact) return;

  const stages = artifact.querySelectorAll('.hero__stage');
  const stateLabel = artifact.querySelector('.hero__mcp-sys-state');

  const stageStates = {
    '1': 'INGEST',
    '2': 'LIVE',
    '3': 'PASS',
  };

  stages.forEach((stage) => {
    const activate = () => {
      stages.forEach((s) => s.classList.remove('hero__stage--active'));
      stage.classList.add('hero__stage--active');
      const stageNum = stage.getAttribute('data-stage');
      if (stateLabel && stageNum && stageStates[stageNum]) {
        stateLabel.textContent = stageStates[stageNum];
      }
    };

    stage.addEventListener('mouseenter', activate);
    stage.addEventListener('click', activate);
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}
