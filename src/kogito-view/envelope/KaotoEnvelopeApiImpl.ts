import { IAssociation, IKaotoChannelApi, IKaotoEnvelopeApi } from '../api';
import { KaotoEnvelopeContext } from './KaotoEnvelopeContext';
import { KaotoEnvelopeViewApi } from './KaotoEnvelopeView';
import { EnvelopeApiFactoryArgs } from '@kie-tools-core/envelope';

/**
 * Implements the KaotoEnvelopeApi.
 *
 * These are the methods that the Channel can call.
 */
export class KaotoEnvelopeApiImpl implements IKaotoEnvelopeApi {
  private view: () => KaotoEnvelopeViewApi;
  constructor(
    private readonly args: EnvelopeApiFactoryArgs<
      IKaotoEnvelopeApi,
      IKaotoChannelApi,
      KaotoEnvelopeViewApi,
      KaotoEnvelopeContext
    >
  ) {}

  /**
   * Inits the Kaoto View.
   *
   * Calling `envelopeClient.associate` is mandatory if this Envelope will send messages
   * back to the Editor (which is almost always the case).
   *
   * @param association
   */
  public async kaoto__init(association: IAssociation) {
    this.args.envelopeClient.associate(association.origin, association.envelopeServerId);
    this.view = await this.args.viewDelegate();
  }

  /**
   * Fetches all catalog steps from the Kaoto view
   */
  public async kaoto__fetchCatalogSteps() {
    return this.view().fetchCatalogSteps();
  }

  /**
   * Fetches all CRDs from the Kaoto view
   */
  public async kaoto__fetchCRDs() {
    return this.view().fetchCRDs();
  }

  /**
   * Fetches all integration deployments from the Kaoto view
   */
  public async kaoto__fetchDeployments() {
    return this.view().fetchDeployments();
  }

  /**
   * Fetches all DSLs from the Kaoto view
   */
  public async kaoto__fetchDSLs() {
    return this.view().fetchDSLs();
  }

  /**
   * Fetches all view definitions from the Kaoto view
   */
  public async kaoto__fetchViewDefinitions() {
    return this.view().fetchViewDefinitions();
  }

  /**
   * Send a notification to the Kaoto view
   */
  public async kaoto__notifyKaoto() {
    return this.view().notifyKaoto();
  }

  /**
   * Triggers a deployment to the Kaoto View
   * @param dsl
   * @param integration
   * @param integrationName The name of the integration to be deployed.
   * @param namespace
   */
  public async kaoto__startDeployment(
    dsl: string,
    integration: any,
    integrationName: string,
    namespace: string
  ) {
    return this.view().startDeployment(dsl, integration, integrationName, namespace);
  }

  /**
   * Returns the current items on the Kaoto View
   * @param integrationName The name of the integration to be stopped.
   */
  public async kaoto__stopDeployment(integrationName: string) {
    return this.view().stopDeployment(integrationName);
  }
}
