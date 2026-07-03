import React, { useState } from 'react';
import { Text, Box, Spacer } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { TEMPLATES, type TemplateOption } from './templates';
import { generateProject } from './generator';

interface CreateWizardProps {
  projectName: string;
}

export function CreateWizard({ projectName }: CreateWizardProps) {
  const [step, setStep] = useState<'name' | 'template' | 'generating'>('name');
  const [inputName, setInputName] = useState(projectName);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [done, setDone] = useState(false);

  const handleNameSubmit = () => {
    if (inputName.trim()) {
      setStep('template');
    }
  };

  const handleTemplateSelect = (item: { value: string }) => {
    const template = TEMPLATES.find(t => t.value === item.value);
    if (!template) return;
    setSelectedTemplate(template.value);
    setStep('generating');
    generateProject(inputName.trim(), template.value);
    setDone(true);
  };

  // Map TemplateOption to ink-select-input Item format (label + value)
  const selectItems = TEMPLATES.map(t => ({ label: `${t.name} — ${t.description}`, value: t.value }));

  return (
    <Box flexDirection="column">
      <Text bold underline>Dualler 项目创建向导</Text>
      <Box marginTop={1}>
        {step === 'name' && (
          <>
            <Text>项目名称: </Text>
            <TextInput
              placeholder={projectName}
              onSubmit={handleNameSubmit}
              value={inputName}
              onChange={setInputName}
            />
          </>
        )}

        {step === 'template' && (
          <>
            <Box flexDirection="column">
              <Text bold>项目: {inputName}</Text>
              <Text>选择模板:</Text>
            </Box>
            <Box marginLeft={2}>
              <SelectInput
                items={selectItems}
                onSelect={handleTemplateSelect}
              />
            </Box>
          </>
        )}

        {step === 'generating' && (
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Spinner type="dots" />
              <Spacer />
              <Text>正在生成项目...</Text>
            </Box>
          </Box>
        )}

        {done && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="green" bold>✓ 项目 {inputName} 创建成功!</Text>
            <Text>  cd {inputName}</Text>
            <Text>  dualler dev</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
