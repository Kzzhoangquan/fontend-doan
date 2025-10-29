import {
  CompaniesService,
  Company,
  Department,
  DepartmentsService,
} from '@/sdk';

/**
 * Interface cho dữ liệu form công ty.
 */
export interface CompanyFormData {
  name: string;
  industry: string;
  address: string;
  website: string; // Tên gốc là homepage trong SDK, cần đồng bộ
  employeeCount: number;
}

/**
 * Interface cho đối tượng công ty đầy đủ bao gồm các phòng ban.
 */
export interface CompanyWithDepartments extends Omit<Company, 'departments'> {
  departments: Department[];
}

/**
 * CompanyService cung cấp các phương thức tĩnh để tương tác với API công ty và phòng ban.
 * Bao gồm các thao tác CRUD và quản lý batch cho phòng ban.
 */
export class CompanyService {
  /**
   * Lấy tất cả các công ty từ API.
   * @returns {Promise<Company[]>} Danh sách công ty.
   * @throws {Error} Nếu có lỗi khi fetch.
   */
  static async getAllCompanies(): Promise<Company[]> {
    try {
      const data = await CompaniesService.companiesControllerFindAll();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách công ty:', error);
      throw new Error('Không thể tải danh sách công ty');
    }
  }

  /**
   * Lấy thông tin công ty theo ID, bao gồm các phòng ban.
   * @param {string} id - ID của công ty.
   * @returns {Promise<CompanyWithDepartments>} Đối tượng công ty với phòng ban.
   * @throws {Error} Nếu không tìm thấy hoặc có lỗi.
   */
  static async getCompanyById(id: string): Promise<CompanyWithDepartments> {
    try {
      const company = await CompaniesService.companiesControllerFindOne({ id });
      // Ép kiểu `departments` từ string[] sang Department[]
      return {
        ...company,
        departments: (company.departments as unknown as Department[]) || [],
      };
    } catch (error) {
      console.error(`Lỗi khi lấy công ty ${id}:`, error);
      throw new Error(`Không thể tải thông tin công ty ID: ${id}`);
    }
  }

  /**
   * Tạo công ty mới.
   * @param {CompanyFormData} formData - Dữ liệu form của công ty.
   * @returns {Promise<Company>} Đối tượng công ty đã tạo.
   * @throws {Error} Nếu có lỗi khi tạo.
   */
  static async createCompany(formData: CompanyFormData): Promise<Company> {
    try {
      const company = await CompaniesService.companiesControllerCreate({
        requestBody: {
          name: formData.name,
          industry: formData.industry,
          address: formData.address,
          homepage: formData.website, // Đồng bộ với tên prop trong SDK
          employeeCount: formData.employeeCount,
        },
      });
      return company;
    } catch (error) {
      console.error('Lỗi khi tạo công ty:', error);
      throw new Error('Không thể tạo công ty');
    }
  }

  /**
   * Cập nhật thông tin công ty hiện có.
   * @param {string} id - ID của công ty.
   * @param {CompanyFormData} formData - Dữ liệu form cập nhật.
   * @returns {Promise<Company>} Đối tượng công ty đã cập nhật.
   * @throws {Error} Nếu không tìm thấy hoặc có lỗi.
   */
  static async updateCompany(
    id: string,
    formData: CompanyFormData
  ): Promise<Company> {
    try {
      const company = await CompaniesService.companiesControllerUpdate({
        id,
        requestBody: {
          name: formData.name,
          industry: formData.industry,
          address: formData.address,
          homepage: formData.website, // Đồng bộ với tên prop trong SDK
          employeeCount: formData.employeeCount,
        },
      });
      return company;
    } catch (error) {
      console.error(`Lỗi khi cập nhật công ty ${id}:`, error);
      throw new Error(`Không thể cập nhật công ty ID: ${id}`);
    }
  }

  /**
   * Xóa công ty.
   * @param {string} id - ID của công ty cần xóa.
   * @returns {Promise<void>}
   * @throws {Error} Nếu không tìm thấy hoặc có lỗi.
   */
  static async deleteCompany(id: string): Promise<void> {
    try {
      await CompaniesService.companiesControllerRemove({ id });
    } catch (error) {
      console.error(`Lỗi khi xóa công ty ${id}:`, error);
      throw new Error(`Không thể xóa công ty ID: ${id}`);
    }
  }

  /**
   * Tạo phòng ban mới cho một công ty.
   * @param {string} companyId - ID của công ty.
   * @param {object} departmentData - Dữ liệu phòng ban.
   * @returns {Promise<Department>} Đối tượng phòng ban đã tạo.
   * @throws {Error} Nếu có lỗi khi tạo.
   */
  static async createDepartment(
    companyId: string,
    departmentData: {
      name: string;
      description: string;
      headcount: number;
    }
  ): Promise<Department> {
    try {
      const department = await DepartmentsService.departmentsControllerCreate({
        requestBody: {
          companyId,
          name: departmentData.name,
          description: departmentData.description,
          headcount: departmentData.headcount,
        },
      });
      return department;
    } catch (error) {
      console.error('Lỗi khi tạo phòng ban:', error);
      throw new Error('Không thể tạo phòng ban');
    }
  }

  /**
   * Cập nhật thông tin phòng ban.
   * @param {string} id - ID của phòng ban.
   * @param {object} departmentData - Dữ liệu phòng ban cập nhật.
   * @returns {Promise<Department>} Đối tượng phòng ban đã cập nhật.
   * @throws {Error} Nếu không tìm thấy hoặc có lỗi.
   */
  static async updateDepartment(
    id: string,
    departmentData: {
      name: string;
      description: string;
      headcount: number;
    }
  ): Promise<Department> {
    try {
      const department = await DepartmentsService.departmentsControllerUpdate({
        id,
        requestBody: {
          name: departmentData.name,
          description: departmentData.description,
          headcount: departmentData.headcount,
        },
      });
      return department;
    } catch (error) {
      console.error(`Lỗi khi cập nhật phòng ban ${id}:`, error);
      throw new Error(`Không thể cập nhật phòng ban ID: ${id}`);
    }
  }

  /**
   * Xóa phòng ban.
   * @param {string} id - ID của phòng ban cần xóa.
   * @returns {Promise<void>}
   * @throws {Error} Nếu không tìm thấy hoặc có lỗi.
   */
  static async deleteDepartment(id: string): Promise<void> {
    try {
      await DepartmentsService.departmentsControllerRemove({ id });
    } catch (error) {
      console.error(`Lỗi khi xóa phòng ban ${id}:`, error);
      throw new Error(`Không thể xóa phòng ban ID: ${id}`);
    }
  }

  /**
   * Thực hiện các thao tác hàng loạt (tạo, cập nhật, xóa) trên các phòng ban.
   * @param {string} companyId - ID của công ty.
   * @param {Department[]} departments - Danh sách phòng ban hiện tại (sau chỉnh sửa).
   * @param {Department[]} originalDepartments - Danh sách phòng ban gốc (trước chỉnh sửa).
   * @returns {Promise<void>}
   * @throws {Error} Nếu có lỗi trong bất kỳ thao tác nào.
   */
  static async batchUpdateDepartments(
    companyId: string,
    departments: Department[],
    originalDepartments: Department[]
  ): Promise<void> {
    try {
      const departmentsToCreate: Omit<Department, 'id'>[] = [];
      const departmentsToUpdate: Department[] = [];
      const departmentIdsToDelete: string[] = [];

      // Xác định các thao tác cần thiết (tạo, cập nhật, xóa)
      const originalDepartmentIds = new Set(originalDepartments.map(d => d.id));
      const currentDepartmentIds = new Set(departments.map(d => d.id));

      // Tìm phòng ban cần tạo mới hoặc cập nhật
      for (const dept of departments) {
        if (
          dept.id.startsWith('temp-') || // Là phòng ban mới (có ID tạm)
          !originalDepartmentIds.has(dept.id) // Hoặc là phòng ban mới không có trong danh sách gốc
        ) {
          if (dept.name.trim() !== '') {
            // Chỉ tạo nếu tên không rỗng
            const { id, ...rest } = dept; // Bỏ qua ID tạm
            departmentsToCreate.push({ ...rest, companyId }); // Gán companyId
          }
        } else {
          departmentsToUpdate.push(dept); // Là phòng ban cần cập nhật
        }
      }

      // Tìm phòng ban cần xóa
      for (const originalDept of originalDepartments) {
        if (!currentDepartmentIds.has(originalDept.id)) {
          departmentIdsToDelete.push(originalDept.id);
        }
      }

      // Thực thi tất cả các Promise song song
      const promises: Promise<unknown>[] = [];

      // Tạo phòng ban mới
      for (const deptData of departmentsToCreate) {
        promises.push(
          this.createDepartment(companyId, {
            name: deptData.name,
            description: deptData.description ?? '',
            headcount: deptData.headcount,
          })
        );
      }

      // Cập nhật phòng ban hiện có
      for (const deptData of departmentsToUpdate) {
        promises.push(
          this.updateDepartment(deptData.id, {
            name: deptData.name,
            description: deptData.description ?? '',
            headcount: deptData.headcount,
          })
        );
      }

      // Xóa phòng ban đã bị loại bỏ
      for (const deptId of departmentIdsToDelete) {
        promises.push(this.deleteDepartment(deptId));
      }

      await Promise.all(promises); // Chờ tất cả các thao tác hoàn tất
    } catch (error) {
      console.error('Lỗi trong các thao tác batch phòng ban:', error);
      throw new Error('Không thể cập nhật các phòng ban');
    }
  }
}
