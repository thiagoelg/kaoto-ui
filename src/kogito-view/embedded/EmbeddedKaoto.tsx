import { IKaotoApi, IKaotoChannelApi, IKaotoEnvelopeApi } from '../api';
import { EnvelopeServer } from '@kie-tools-core/envelope-bus/dist/channel';
import { ContainerType } from '@kie-tools-core/envelope/dist/api';
import {
  EmbeddedEnvelopeProps,
  RefForwardingEmbeddedEnvelope,
} from '@kie-tools-core/envelope/dist/embedded';
import { forwardRef, useCallback, useMemo } from 'react';

export type EmbeddedKaotoRef = IKaotoApi & {
  envelopeServer: EnvelopeServer<IKaotoChannelApi, IKaotoEnvelopeApi>;
};

export type Props = {
  targetOrigin: string;
  envelopePath: string;
  apiImpl: IKaotoChannelApi;
};

/**
 * Convenience component to embed a Kaoto View.
 * Specific to React.
 * It's a component used by the Channel, which makes the communication
 * between the Channel and the Envelope. Hence, it connects the interfaces
 * from the api directory.
 *
 * This is aimed to be used mostly by Web applications. It exposes a `ref` to give control to the parent component.
 */
export const EmbeddedKaoto = forwardRef<EmbeddedKaotoRef, Props>((props, forwardedRef) => {
  /*
   * This is the pollInit parameter. Used to connect the Envelope with this instance of EnvelopeServer.
   */
  const pollInit = useCallback(
    (
      envelopeServer: EnvelopeServer<IKaotoChannelApi, IKaotoEnvelopeApi>,
      container: () => HTMLDivElement | HTMLIFrameElement
    ) => {
      return envelopeServer.envelopeApi.requests.kaoto__init({
        origin: envelopeServer.origin,
        envelopeServerId: envelopeServer.id,
      });
    },
    []
  );

  /*
   * Function that creates a `ref` to be exposed to the parent components.
   */
  const refDelegate = useCallback(
    (envelopeServer: EnvelopeServer<IKaotoChannelApi, IKaotoEnvelopeApi>): EmbeddedKaotoRef => ({
      envelopeServer,
      fetchCatalogSteps: () => envelopeServer.envelopeApi.requests.kaoto__fetchCatalogSteps(),
      fetchCRDs: () => envelopeServer.envelopeApi.requests.kaoto__fetchCRDs(),
      fetchDeployments: () => envelopeServer.envelopeApi.requests.kaoto__fetchDeployments(),
      fetchDSLs: () => envelopeServer.envelopeApi.requests.kaoto__fetchDSLs(),
      fetchViewDefinitions: () => envelopeServer.envelopeApi.requests.kaoto__fetchViewDefinitions(),
      notifyKaoto: () => envelopeServer.envelopeApi.requests.kaoto__notifyKaoto(),
      startDeployment: () => envelopeServer.envelopeApi.requests.kaoto__startDeployment(),
      stopDeployment: () => envelopeServer.envelopeApi.requests.kaoto__stopDeployment(),
    }),
    []
  );

  const config = useMemo(() => {
    return { containerType: ContainerType.IFRAME, envelopePath: props.envelopePath };
  }, [props.envelopePath]);

  return (
    <EmbeddedKaotoEnvelope
      ref={forwardedRef}
      apiImpl={props.apiImpl}
      origin={props.targetOrigin}
      refDelegate={refDelegate}
      pollInit={pollInit}
      config={config}
    />
  );
});

/**
 * forwardRef provides a way to access the component imperatively and
 * access its exposed methods. Also enables React hooks.
 */
const EmbeddedKaotoEnvelope = forwardRef<
  EmbeddedKaotoRef,
  EmbeddedEnvelopeProps<IKaotoChannelApi, IKaotoEnvelopeApi, EmbeddedKaotoRef>
>(RefForwardingEmbeddedEnvelope);
