import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      style={{ minWidth: 140 }}
      size="middle"
      suffixIcon={<GlobalOutlined />}
    >
      {languages.map((lang) => (
        <Option key={lang.code} value={lang.code}>
          <Space>
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </Space>
        </Option>
      ))}
    </Select>
  );
};