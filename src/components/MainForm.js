import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Collapse,
  Upload,
  Checkbox,
  Icon,
  Input,
  Form,
  Switch,
  Select,
  Typography,
  Modal,
  Tabs,
  message
} from 'antd';

const { Dragger } = Upload;
const { Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;

const requirePassphrase = algo => ['AES', 'Blowfish'].includes(algo);

@connect(({ rpc }) => ({}))
@Form.create()
class MainForm extends React.Component {
  state = {
    keyFile: [],
    fileList: [],
    algorithm: ''
  };

  onRemove = file => {
    this.setState(state => {
      const index = state.fileList.indexOf(file);
      const newFileList = state.fileList.slice();
      newFileList.splice(index, 1);
      return {
        fileList: newFileList
      };
    });
  };
  beforeUpload = file => {
    this.setState(state => ({
      fileList: [...state.fileList, file]
    }));
    return false;
  };

  onRemoveKey = key => {
    this.setState({
      keyFile: []
    });
    return false;
  };
  onAddKey = key => {
    const { keyFile } = this.state;
    if (keyFile.length === 1) {
      message.error('Only one keyfile is needed to decrypt/encrypt');
      return false;
    }
    this.setState({
      keyFile: [key]
    });
    return false;
  };

  submit = e => {
    e.preventDefault();

    const { dispatch } = this.props;
    const { fileList, keyFile } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { algo, encrypt, passphrase } = values;
        const type = encrypt ? 'rpc/encrypt' : 'rpc/decrypt';
        let key;

        if (requirePassphrase(algo)) key = passphrase;
        else key = keyFile[0].path;
        dispatch({
          type,
          payload: {
            fileList: fileList.map(f => f.path),
            key,
            algo
          }
        });
      }
    });
  };

  render() {
    const { algorithm, keyFile, fileList } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.submit}>
        <Form.Item>
          {getFieldDecorator('fileList', {
            rules: [
              {
                required: true,
                message: 'Please select file to encrypt/decrypt'
              }
            ]
          })(
            <Dragger
              name="file"
              multiple={true}
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              fileList={fileList}
            >
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to encrypt
              </p>
            </Dragger>
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('algo', {
            rules: [
              {
                required: true,
                message: 'Please select algorithm to encrypt/decrypt'
              }
            ]
          })(
            <Select
              placeholder="Select an algorithm"
              onChange={val => this.setState({ algorithm: val })}
            >
              <Option value="RSA">RSA</Option>
              <Option value="AES">AES</Option>
              <Option value="Blowfish">Blowfish</Option>
              <Option value="ECC" disabled>
                ECC
              </Option>
            </Select>
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('keyFile', {
            rules: [
              {
                required: !requirePassphrase(algorithm),
                message: 'The algorithm chosen required a key file'
              }
            ]
          })(
            <Upload
              beforeUpload={this.onAddKey}
              onRemove={this.onRemoveKey}
              fileList={keyFile}
              disabled={requirePassphrase(algorithm)}
            >
              <Button
                type="primary"
                style={{ marginTop: 16 }}
                disabled={requirePassphrase(algorithm)}
              >
                Add Key File
              </Button>
            </Upload>
          )}
        </Form.Item>

        <Form.Item label="passphrase">
          {getFieldDecorator('passphrase', {
            rules: [
              {
                required: requirePassphrase(algorithm),
                message: 'The algorithm chosen requires a passphrase'
              }
            ]
          })(
            <Input
              disabled={!requirePassphrase(algorithm)}
              style={{ width: '100%' }}
            />
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('encrypt', {
            valuePropName: 'encrypt'
          })(<Checkbox>Encrypt</Checkbox>)}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default MainForm;
