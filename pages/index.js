import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select } from "antd";

export default function HomePage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchText, setSearchText] = useState("")
  const [sortField, setSortField] = useState("")
  const [sortOrder, setSortOrder] = useState("ascend")
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const loadings = () => {
    messageApi
      .open({
        type: 'loading',
        content: 'Action in progress..',
        duration: 1,
      })
      .then(() => message.success('Loading finished', 2.5))
      .then(() => message.info('Loading finished', 2.5));
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/students/crud");
      const studentsData = res.data?.body?.data || [];
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (values) => {
    const dataToSend = { ...values, class_name: values.class };
    delete dataToSend.class;

    try {
      const res = await axios.post(API_URL, dataToSend);
      const newStudent = res.data?.body?.data || dataToSend; 
       messageApi.open({
        type: 'success',
        content: 'Successfully to add student!',
        duration: 2
      })

      setStudents((prev) => [...prev, newStudent]);
      setFilteredStudents((prev) => [...prev, newStudent]);


      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error("Add error:", err);
      messageApi.open({
        type: 'error',
        content: 'Failed to add student',
        duration: 2
      })
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      name: student.name,
      nis: student.nis,
      class: student.class_name,
      major: student.major,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (values) => {
    if (!editingStudent) return;

    const dataToSend = { ...values, class_name: values.class };
    delete dataToSend.class;

    setStudents(prev =>
      prev.map(student =>
        student.id === editingStudent.id ? { ...student, ...dataToSend } : student
      )
    );

     setFilteredStudents((prev) =>
      prev.map((student) =>
        student.id === editingStudent.id
          ? { ...student, ...dataToSend }
          : student
      )
    );

    messageApi.open({
      type: 'success',
      content: 'Successfully updated student!',
      duration: 2
    });

    setIsEditModalOpen(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const handleDelete = async (id) => {
    setStudents(prev => prev.filter(student => student.id !== id));

    messageApi.open({
      type: 'success',
      content: 'Successfully deleted student!',
      duration: 2
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(value) ||
        student.nis?.toLowerCase().includes(value) ||
        student.class_name?.toLowerCase().includes(value) ||
        student.major?.toLowerCase().includes(value)
    );
    setFilteredStudents(filtered);
  };

  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  useEffect(() => {
    let sorted = [...filteredStudents];
    if (sortField) {
      sorted.sort((a, b) => {
        const aVal = a[sortField]?.toString().toLowerCase() || "";
        const bVal = b[sortField]?.toString().toLowerCase() || "";
        if (sortOrder === "ascend") {
          return aVal.localeCompare(bVal);
        } else {
          return bVal.localeCompare(aVal);
        }
      });
    }
    setFilteredStudents(sorted);
  }, [sortField, sortOrder, students]);

 const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "NIS",
      dataIndex: "nis",
      key: "nis",
      sorter: (a, b) => a.nis.localeCompare(b.nis),
    },
    {
      title: "Class",
      dataIndex: "class_name",
      key: "class_name",
      sorter: (a, b) => a.class_name.localeCompare(b.class_name),
    },
    {
      title: "Major",
      dataIndex: "major",
      key: "major",
      sorter: (a, b) => a.major.localeCompare(b.major),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this student?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 34, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>
        Student List ({filteredStudents.length})
      </h1>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name, NIS, class, or major..."
          value={searchText}
          onChange={handleSearch}
          style={{ width: 300 }}
          allowClear
        />

        <Select
          placeholder="Sort by"
          style={{ width: 150 }}
          onChange={(value) => handleSort(value, sortOrder)}
          allowClear
        >
          <Select.Option value="name">Name</Select.Option>
          <Select.Option value="nis">NIS</Select.Option>
          <Select.Option value="class_name">Class</Select.Option>
          <Select.Option value="major">Major</Select.Option>
        </Select>

        <Select
          value={sortOrder}
          style={{ width: 120 }}
          onChange={(value) => handleSort(sortField, value)}
        >
          <Select.Option value="ascend">Ascending</Select.Option>
          <Select.Option value="descend">Descending</Select.Option>
        </Select>

        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
        >
          Add Student
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredStudents}
        loading={loading}
        rowKey={(record) => record.id || record.nis}
      />


      <Modal
        title="Add New Student"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddStudent}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="NIS"
            name="nis"
            rules={[{ required: true, message: "Please enter NIS" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Class"
            name="class"
            rules={[{ required: true, message: "Please enter class" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Major"
            name="major"
            rules={[{ required: true, message: "Please enter major" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            {contextHolder}
            <Button type="primary" htmlType="submit" onClick={loadings}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Student"
        open={isEditModalOpen}
        dataSource={filteredStudents}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateStudent}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="NIS"
            name="nis"
            rules={[{ required: true, message: "Please enter NIS" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Class"
            name="class"
            rules={[{ required: true, message: "Please enter class" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Major"
            name="major"
            rules={[{ required: true, message: "Please enter major" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            {contextHolder}
            <Button type="primary" htmlType="submit" onClick={loadings}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
