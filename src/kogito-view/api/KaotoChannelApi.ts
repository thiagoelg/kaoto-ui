/**
 * Methods provided by the Channel that can be consumed by the Envelope.
 */
export interface IKaotoChannelApi {
  kaoto__fetchDeployments(): void;
  kaoto__startDeployment(
    dsl: string,
    integration: any,
    integrationName: string,
    namespace: string
  ): void;
  kaoto__stopDeployment(integrationName: string): void;
}
