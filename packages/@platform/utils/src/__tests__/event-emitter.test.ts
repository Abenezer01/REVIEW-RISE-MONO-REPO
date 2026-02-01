import { EventEmitter } from '../event-emitter';

describe('EventEmitter', () => {
  it('should emit and receive events', () => {
    const emitter = new EventEmitter();
    const mockHandler = jest.fn();

    emitter.on('test', mockHandler);
    emitter.emit('test', { foo: 'bar' });

    expect(mockHandler).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should remove handlers', () => {
    const emitter = new EventEmitter();
    const mockHandler = jest.fn();

    emitter.on('test', mockHandler);
    emitter.off('test', mockHandler);
    emitter.emit('test', { foo: 'bar' });

    expect(mockHandler).not.toHaveBeenCalled();
  });
});
