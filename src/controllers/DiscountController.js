class DiscountController {
  constructor(discountServices) {
    this.discountServices = discountServices;
  }

  async save(req, res) {
    try {
      const discount = req.body;
      const id = await this.discountServices.save(discount);
      return res.status(201).json({ id });
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const { ano, mes } = req.query;
      const user = req.user; // Vem do middleware de autenticação
      
      const discounts = await this.discountServices.findAll({ 
        user, 
        ano: ano ? parseInt(ano) : null, 
        mes: mes ? parseInt(mes) : null 
      });
      
      return res.status(200).json(discounts);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const discount = await this.discountServices.findById(id);
      
      if (!discount) {
        return res.status(404).json({ message: 'Desconto não encontrado' });
      }
      
      return res.status(200).json(discount);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const discount = req.body;
      
      await this.discountServices.update(discount, id);
      return res.status(204).send();
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.discountServices.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message });
    }
  }

  async getTotalByUser(req, res) {
    try {
      const { userId } = req.params;
      const { ano, mes } = req.query;
      
      const total = await this.discountServices.getTotalByUser(
        userId, 
        ano ? parseInt(ano) : null, 
        mes ? parseInt(mes) : null
      );
      
      return res.status(200).json({ total });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async findByUser(req, res) {
    try {
      const { userId } = req.params;
      const { ano, mes } = req.query;
      
      const discounts = await this.discountServices.findByUser(
        userId, 
        ano ? parseInt(ano) : null, 
        mes ? parseInt(mes) : null
      );
      
      return res.status(200).json(discounts);
    } catch (error) {
      console.error('❌ [DiscountController] Erro:', error);
      return res.status(400).json({ message: error.message });
    }
  }
}

export { DiscountController };