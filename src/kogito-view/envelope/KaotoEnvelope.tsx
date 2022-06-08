import { IKaotoChannelApi, IKaotoEnvelopeApi } from '../api';
import { KaotoEnvelopeApiImpl } from './KaotoEnvelopeApiImpl';
import { KaotoEnvelopeContext } from './KaotoEnvelopeContext';
import { IKaotoEnvelopeView, IKaotoEnvelopeViewApi } from './KaotoEnvelopeView';
import { Envelope } from '@kie-tools-core/envelope';
import { EnvelopeBus } from '@kie-tools-core/envelope-bus/dist/api';
import { createRef } from 'react';
import * as ReactDOM from 'react-dom';

/**
 * Function that starts an Envelope application.
 *
 * @param args.container: The HTML element in which the Kaoto View will render
 * @param args.bus: The implementation of a `bus` that knows how to send messages to the Channel.
 *
 */
export function init(args: { container: HTMLElement; bus: EnvelopeBus }) {
  /**
   * Creates a new generic Envelope, typed with the right interfaces.
   */
  const envelope = new Envelope<
    IKaotoEnvelopeApi,
    IKaotoChannelApi,
    IKaotoEnvelopeViewApi,
    KaotoEnvelopeContext
  >(args.bus);

  /**
   * Function that knows how to render a Kaoto View.
   * In this case, it's a React application, but any other framework can be used.
   *
   * Returns a Promise<() => KaotoEnvelopeViewApi> that can be used in KaotoEnvelopeApiImpl.
   */
  const envelopeViewDelegate = async () => {
    const ref = createRef<IKaotoEnvelopeViewApi>();
    return new Promise<() => IKaotoEnvelopeViewApi>((res) => {
      ReactDOM.render(
        <IKaotoEnvelopeView ref={ref} channelApi={envelope.channelApi} />,
        args.container,
        () => res(() => ref.current!)
      );
    });
  };

  // Starts the Envelope application with the provided KaotoEnvelopeApi implementation.
  const context: KaotoEnvelopeContext = {};
  return envelope.start(envelopeViewDelegate, context, {
    create: (apiFactoryArgs) => new KaotoEnvelopeApiImpl(apiFactoryArgs),
  });
}
