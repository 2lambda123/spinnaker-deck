import { isNil } from 'lodash';
import React from 'react';

import type { IFormikStageConfigInjectedProps } from '../FormikStageConfig';
import { HELM_RENDERERS, HELMFILE_RENDERER, KUSTOMIZE_RENDERERS } from './ManifestRenderers';
import { ExpectedArtifactService } from '../../../../artifact';
import { StageConfigField } from '../common';
import type { IExpectedArtifact } from '../../../../domain';
import { BakeHelmConfigForm } from './helm/BakeHelmConfigForm';
import { BakeHelmfileConfigForm } from './helmfile/BakeHelmfileConfigForm';
import { BakeKustomizeConfigForm } from './kustomize/BakeKustomizeConfigForm';
import { ReactSelectInput } from '../../../../presentation';
import { BASE_64_ARTIFACT_ACCOUNT, BASE_64_ARTIFACT_TYPE } from '../../triggers/artifacts/base64/Base64ArtifactEditor';

export function BakeManifestStageForm({ application, formik, pipeline }: IFormikStageConfigInjectedProps) {
  const stage = formik.values;

  React.useEffect(() => {
    if (!validateProducedArtifacts(stage.expectedArtifacts)) {
      const defaultProducedArtifact = ExpectedArtifactService.createEmptyArtifact();
      defaultProducedArtifact.matchArtifact.type = BASE_64_ARTIFACT_TYPE;
      defaultProducedArtifact.matchArtifact.artifactAccount = BASE_64_ARTIFACT_ACCOUNT;
      defaultProducedArtifact.matchArtifact.customKind = false;
      formik.setFieldValue('expectedArtifacts', [defaultProducedArtifact]);
    }
  }, []);

  // Clear renderer-specific fields when selected renderer changes
  React.useEffect(() => {
    if (KUSTOMIZE_RENDERERS.includes(stage.templateRenderer) && !isNil(stage.inputArtifacts)) {
      formik.setFieldValue('inputArtifacts', null);
    }
    if (HELM_RENDERERS.includes(stage.templateRenderer) && !isNil(stage.inputArtifact)) {
      formik.setFieldValue('inputArtifact', null);
    }
    if (HELMFILE_RENDERER === stage.templateRenderer && !isNil(stage.inputArtifact)) {
      formik.setFieldValue('inputArtifact', null);
    }
  }, [stage.templateRenderer]);

  const templateRenderers = React.useMemo(() => {
    return [...KUSTOMIZE_RENDERERS, ...HELM_RENDERERS, HELMFILE_RENDERER];
  }, []);

  return (
    <div className="form-horizontal clearfix">
      <div className="container-fluid form-horizontal">
        <h4>Template Renderer</h4>
        <StageConfigField
          fieldColumns={3}
          label={'Render Engine'}
          helpKey={'pipeline.config.bake.manifest.templateRenderer'}
        >
          <ReactSelectInput
            clearable={false}
            onChange={(o: React.ChangeEvent<HTMLSelectElement>) => {
              formik.setFieldValue('templateRenderer', o.target.value);
            }}
            value={stage.templateRenderer}
            stringOptions={templateRenderers}
          />
        </StageConfigField>
        {KUSTOMIZE_RENDERERS.includes(stage.templateRenderer) && (
          <BakeKustomizeConfigForm pipeline={pipeline} application={application} formik={formik} />
        )}
        {HELM_RENDERERS.includes(stage.templateRenderer) && (
          <BakeHelmConfigForm pipeline={pipeline} application={application} formik={formik} />
        )}
        {HELMFILE_RENDERER === stage.templateRenderer && (
          <BakeHelmfileConfigForm pipeline={pipeline} application={application} formik={formik} />
        )}
      </div>
    </div>
  );
}

export function validateProducedArtifacts(artifacts: IExpectedArtifact[]): boolean {
  return artifacts?.length === 1 && artifacts[0]?.matchArtifact?.type === BASE_64_ARTIFACT_TYPE;
}
