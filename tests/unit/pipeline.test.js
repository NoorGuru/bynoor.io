import { describe, it, expect, beforeEach } from 'vitest';
import { initPipeline } from '../../src/scripts/pipeline.js';

const PIPELINE_HTML = `
  <div class="hero__mcp-artifact">
    <div class="hero__mcp-header">
      <div class="hero__mcp-status">
        <span class="hero__mcp-dot">●</span>
        <span class="hero__mcp-title">MCP PROTOCOL · ACTIVE ORCHESTRATION</span>
      </div>
      <span class="hero__mcp-sys-state">READY · 48ms</span>
    </div>
    <div class="hero__pipeline">
      <div class="hero__stage hero__stage--1" data-stage="1" tabindex="0">
        <span class="hero__stage-name">Task Ingestion</span>
      </div>
      <div class="hero__stage hero__stage--2 hero__stage--active" data-stage="2" tabindex="0">
        <span class="hero__stage-name">Tool Delegation (MCP)</span>
      </div>
      <div class="hero__stage hero__stage--3" data-stage="3" tabindex="0">
        <span class="hero__stage-name">Autonomous Verification</span>
      </div>
    </div>
    <div class="hero__mcp-metric">
      <span class="hero__mcp-metric-value">weeks → hours</span>
      <span class="hero__mcp-metric-tag">(96% latency reduction)</span>
    </div>
  </div>
`;

describe('MCP Pipeline interactivity', () => {
  beforeEach(() => {
    document.body.innerHTML = PIPELINE_HTML;
  });

  it('does nothing when no artifact is in the DOM', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => initPipeline()).not.toThrow();
  });

  it('activates stage 1 on click and updates telemetry status', () => {
    initPipeline();
    const stage1 = document.querySelector('[data-stage="1"]');
    const stage2 = document.querySelector('[data-stage="2"]');
    const stateLabel = document.querySelector('.hero__mcp-sys-state');

    expect(stage2.classList.contains('hero__stage--active')).toBe(true);

    stage1.click();

    expect(stage1.classList.contains('hero__stage--active')).toBe(true);
    expect(stage2.classList.contains('hero__stage--active')).toBe(false);
    expect(stateLabel.textContent).toContain('INGEST');
  });

  it('activates stage 3 on mouseenter and updates telemetry status', () => {
    initPipeline();
    const stage3 = document.querySelector('[data-stage="3"]');
    const stateLabel = document.querySelector('.hero__mcp-sys-state');

    stage3.dispatchEvent(new MouseEvent('mouseenter'));

    expect(stage3.classList.contains('hero__stage--active')).toBe(true);
    expect(stateLabel.textContent).toContain('PASS');
  });

  it('activates stage on Enter keydown', () => {
    initPipeline();
    const stage1 = document.querySelector('[data-stage="1"]');
    stage1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

    expect(stage1.classList.contains('hero__stage--active')).toBe(true);
  });
});
