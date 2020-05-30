import React from 'react';

import PluginForm from '@/components/PluginForm';
import PanelSection from '../PanelSection';

const CreateStep3: React.FC = () => {
  return (
    <>
      <PanelSection title="已启用">
        <PluginForm name="key-auth" onFinish={() => {}} />
      </PanelSection>
    </>
  );
};

export default CreateStep3;
