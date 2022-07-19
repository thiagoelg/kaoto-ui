import { useIntegrationJsonStore, useSettingsStore } from '../api';
import { IStepProps, IVizStepNodeData } from '../types';
import { appendableStepTypes, canStepBeReplaced } from '../utils/validationService';
import { MiniCatalog } from './MiniCatalog';
import './Visualization.css';
import { AlertVariant, Button, Popover } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, Node, NodeProps, Position, useNodes } from 'react-flow-renderer';

const currentDSL = useSettingsStore.getState().settings.dsl;
const addStep = useIntegrationJsonStore.getState().addStep;
const replaceStep = useIntegrationJsonStore.getState().replaceStep;
const steps = useIntegrationJsonStore.getState().integrationJson.steps;

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: NodeProps<IVizStepNodeData>) => {
  const nodes: Node[] = useNodes();
  const isLastNode = nodes[nodes.length - 1].data.UUID === data.UUID;

  const { addAlert } = useAlert() || {};

  const borderColor =
    data.step?.type === 'START'
      ? 'rgb(0, 136, 206)'
      : data.step?.type === 'END'
      ? 'rgb(149, 213, 245)'
      : 'rgb(204, 204, 204)';

  /**
   * Handles selecting a step from the Mini Catalog (append step)
   */
  const onMiniCatalogClickAdd = (selectedStep: any) => addStep(selectedStep);

  /**
   * Handles dropping a step onto an existing step (i.e. step replacement)
   * @param event
   * @param data
   */
  const onDropReplace = (event: any, data: any) => {
    event.preventDefault();

    const dataJSON = event.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    const validation = canStepBeReplaced(data, step, steps);

    // Replace step
    if (validation.isValid) {
      // update the steps, the new node will be created automatically
      replaceStep(step, data.index);
    } else {
      // the step CANNOT be replaced, the proposed step is invalid
      addAlert &&
        addAlert({
          title: 'Replace Step Unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    }
  };

  /**
   * Handles dropping a step onto a slot
   * @param e
   */
  const onDropNew = (e: { dataTransfer: { getData: (arg0: string) => any } }) => {
    const dataJSON = e.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    const validation = canStepBeReplaced(data, step, steps);
    console.table(step);

    if (validation.isValid) {
      // update the steps, the new node will be created automatically
      replaceStep(step, data.index);
      // addStep(step);
    } else {
      console.log('step CANNOT be replaced');
      addAlert &&
        addAlert({
          title: 'Add Step Unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    }
  };

  return (
    <>
      {data.step ? (
        <div
          className={'stepNode'}
          style={{ border: '2px solid ' + borderColor, borderRadius: '50%' }}
          onDrop={onDropReplace}
        >
          {/* LEFT EDGE */}
          {data.step.type !== 'END' && !isLastNode && (
            <Handle
              isConnectable={false}
              type="source"
              position={Position.Right}
              id="b"
              style={{ borderRadius: 0 }}
            />
          )}

          {/* PLUS BUTTON TO ADD STEP */}
          {data.step.type !== 'END' && isLastNode && (
            <Popover
              appendTo={() => document.body}
              aria-label="Search for a step"
              bodyContent={
                <MiniCatalog
                  handleSelectStep={onMiniCatalogClickAdd}
                  queryParams={{
                    dsl: currentDSL,
                    type: appendableStepTypes(data.step.type),
                  }}
                />
              }
              enableFlip={true}
              flipBehavior={['top-start', 'left-start']}
              hideOnOutsideClick={true}
              position={'right-start'}
            >
              <div className={'stepNode__Add nodrag'}>
                <Button variant="plain" aria-label="Action">
                  <PlusCircleIcon />
                </Button>
              </div>
            </Popover>
          )}

          {/* VISUAL REPRESENTATION OF STEP WITH ICON */}
          <div className={'stepNode__Icon stepNode__clickable'}>
            <img src={data.step.icon} alt={data.label} />
          </div>

          {/* RIGHT EDGE */}
          {data.step.type !== 'START' && (
            <Handle
              isConnectable={false}
              type="target"
              position={Position.Left}
              id="a"
              style={{ borderRadius: 0 }}
            />
          )}

          {/* STEP LABEL */}
          <div className={'stepNode__Label stepNode__clickable'}>{data.label}</div>
        </div>
      ) : (
        <div
          className={'stepNode stepNode__clickable'}
          style={{ border: '2px solid rgb(149, 213, 245)', borderRadius: '50%' }}
          onDrop={onDropNew}
        >
          <div className={'stepNode__Icon stepNode__clickable'}>
            <CubesIcon />
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="b"
            style={{ borderRadius: 0 }}
            isConnectable={false}
          />
          <div className={'stepNode__Label stepNode__clickable'}>{data.label}</div>
        </div>
      )}
    </>
  );
};

export { VisualizationStep };
