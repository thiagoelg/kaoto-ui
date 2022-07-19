import { IIntegration, IStepProps, IVizStepPropsNode } from '../types';
import { useDeploymentStore } from './deploymentStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from 'react-flow-renderer';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import create from 'zustand';

interface IIntegrationJsonStore {
  addNode: (node: IVizStepPropsNode) => void;
  addStep: (newStep: IStepProps) => void;
  deleteIntegration: () => void;
  deleteStep: (index: number) => void;
  edges: Edge[];
  // init: (onDropChange: () => void, onMiniCatalogClickAdd: () => void) => void;
  integrationJson: IIntegration;
  nodes: IVizStepPropsNode[];
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodesChange: OnNodesChange;
  updateEdges: (newEdges: Edge[]) => void;
  updateIntegration: (newInt?: any) => void;
  updateNode: (nodeId: string, text: string) => void;
  updateNodes: (newNodes: IVizStepPropsNode[]) => void;
  replaceStep: (newStep: IStepProps, oldStepIndex: number) => void;
}

const initialIntegration: IIntegration = {
  metadata: { name: 'integration', dsl: 'KameletBinding', namespace: 'default' },
  steps: [],
  params: [],
};

/**
 * Regenerate a UUID for a list of Steps
 * Every time there is a change to steps or their positioning in the Steps array,
 * their UUIDs need to be regenerated
 * @param steps
 */
function regenerateUuids(steps: IStepProps[]) {
  const newSteps = steps.slice();
  newSteps.map((step, idx) => {
    step.UUID = step.name + idx;
  });
  return newSteps;
}

export const useIntegrationJsonStore = create<IIntegrationJsonStore>((set, get) => ({
  integrationJson: initialIntegration,
  nodes: [],
  edges: [],
  addNode(node: IVizStepPropsNode) {
    set({
      nodes: [...get().nodes, node],
    });
  },
  addStep: (newStep) =>
    set((state) => {
      console.log('integrationJson state has changed..', state);
      return {
        integrationJson: {
          ...state.integrationJson,
          steps: [...state.integrationJson.steps, newStep],
        },
      };
    }),
  deleteIntegration: () => set({ integrationJson: initialIntegration }),
  deleteStep: (stepId) =>
    set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: regenerateUuids(state.integrationJson.steps.filter((_step, idx) => idx !== stepId)),
      },
    })),
  onConnect: (connection: Connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    console.log('edge change.. ', changes);
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },
  onNodesChange: (changes: NodeChange[]) => {
    console.log('nodes changed.. ', changes);
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },
  replaceStep: (newStep, oldStepIndex) => {
    let newSteps = get().integrationJson.steps.slice();
    newSteps[oldStepIndex] = newStep;
    return set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: regenerateUuids(newSteps),
      },
    }));
  },
  updateEdges: (newEdges: Edge[]) =>
    set((state) => ({
      edges: [...state.edges, ...newEdges],
    })),
  updateIntegration: (newInt) => {
    let newIntegration = { ...get().integrationJson, ...newInt };
    newIntegration.steps = regenerateUuids(newIntegration.steps);
    return set({ integrationJson: { ...newIntegration } });
  },
  updateNode(nodeId: string, text: any) {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, text } };
        }
        return node;
      }),
    });
  },
  updateNodes: (newNodes: IVizStepPropsNode[]) =>
    set((state) => ({
      nodes: [...state.nodes, ...newNodes],
    })),
}));

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('integrationJsonStore', useIntegrationJsonStore);
  mountStoreDevtool('integrationSourceStore', useIntegrationSourceStore);
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}
