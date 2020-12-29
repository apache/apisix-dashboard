import { useEffect } from 'react';
import { getIntl } from 'umi';

/**
 * Force convert some texts with i18n
*/
const useForceIntl = () => {
  useEffect(() => {
    const hasProTable = Boolean(document.querySelector('.ant-pro-table-search'));

    if (!hasProTable) {
      return;
    }

    const { locale } = getIntl();
    if (locale === 'zh-cn') {
      return;
    }

    // NOTE: i18n in https://procomponents.ant.design/components/table/ is not working
    const i18nMapper = [
      ['//span[text()="查 询"]', 'Query'],
      ['//span[text()="重 置"]', 'Reset'],
    ];

    i18nMapper.forEach(([XPathExpression, targetText]) => {
      const ele = document.evaluate(XPathExpression, document).iterateNext() as HTMLElement;
      if (!ele) {
        return;
      }
      ele.innerText = targetText;
    });
  }, []);
};

export default useForceIntl;
