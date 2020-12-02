import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useIntl } from 'umi';

const Info: React.FC = () => {
  const { formatMessage } = useIntl();

  return (
    <PageContainer title={formatMessage({ id: 'page.info.pageContainer.title' })}>
      <select className="selector" id="selector" style={{ backgroundColor: "#fff", width: "100%", height: "24px", textAlign: "right", padding: "16px 24px", marginBottom: "15px" }}>
        <option value="categoryA">CategoryA</option>
        <option value="categoryB">CategoryB</option>
        <option value="categoryC">CategoryC</option>
      </select>
      <div className="wrap" style={{ width: "100%", height: "740px", padding: "16px 24px", margin: "0 auto", backgroundColor: "#fff" }}>
        <table style={{ color: "rgba(0, 0, 0, 0.45)", width: "100%", borderBottom: "1px solid grey", borderCollapse: "collapse", borderTop: "1px solid grey" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 8px" }}>categoryA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#f3f4f5" }}>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr style={{ backgroundColor: "#f3f4f5" }}>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
          </tbody>
        </table>
        <table style={{ color: "rgba(0, 0, 0, 0.45)", width: "100%", borderBottom: "1px solid grey", borderCollapse: "collapse", }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 8px" }}>categoryA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#f3f4f5" }}>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr style={{ backgroundColor: "#f3f4f5" }}>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
          </tbody>
        </table>
        <table style={{ color: "rgba(0, 0, 0, 0.45)", width: "100%", borderBottom: "1px solid grey", borderCollapse: "collapse", }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 8px" }}>categoryA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#f3f4f5" }}>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr style={{ backgroundColor: "#f3f4f5" }}>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
            <tr>
              <td style={{ padding: "12px 8px" }}>key</td>
              <td style={{ textAlign: "right", padding: "12px 8px" }}>value</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};

export default Info;
