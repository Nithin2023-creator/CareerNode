const { EventEmitter } = require('events');

// In-memory, per-company buffered log bus (same style as the `activeCampaigns` Map in
// campaignService.js) - lets an admin's browser tab connect mid-run and replay everything
// that already happened, then keep tailing live lines via SSE, without persisting every
// line to the DB while a run is still in progress.
const MAX_BUFFERED_LINES = 1000;

class ScrapeLogBus {
  constructor() {
    /** @type {Map<string, { lines: string[], emitter: EventEmitter }>} */
    this.buses = new Map();
  }

  _getOrCreate(companyId) {
    const key = companyId.toString();
    let bus = this.buses.get(key);
    if (!bus) {
      bus = { lines: [], emitter: new EventEmitter() };
      // Many SSE clients (admin tabs) may subscribe to the same run.
      bus.emitter.setMaxListeners(50);
      this.buses.set(key, bus);
    }
    return bus;
  }

  append(companyId, message) {
    const bus = this._getOrCreate(companyId);
    const line = `[${new Date().toISOString()}] ${message}`;
    bus.lines.push(line);
    if (bus.lines.length > MAX_BUFFERED_LINES) {
      bus.lines.shift();
    }
    bus.emitter.emit('line', line);
    return line;
  }

  getBuffered(companyId) {
    const bus = this.buses.get(companyId.toString());
    return bus ? [...bus.lines] : [];
  }

  subscribe(companyId, onLine) {
    const bus = this._getOrCreate(companyId);
    bus.emitter.on('line', onLine);
    return () => bus.emitter.off('line', onLine);
  }

  // Signals SSE clients that the run has finished so they can close the connection.
  end(companyId) {
    const bus = this.buses.get(companyId.toString());
    if (bus) bus.emitter.emit('end');
  }

  onEnd(companyId, onEndCb) {
    const bus = this._getOrCreate(companyId);
    bus.emitter.on('end', onEndCb);
    return () => bus.emitter.off('end', onEndCb);
  }

  // Clears the buffer once a run's logs have been persisted to its ScrapeRun doc.
  clear(companyId) {
    this.buses.delete(companyId.toString());
  }
}

module.exports = new ScrapeLogBus();
