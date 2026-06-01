package com.result.main;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
	"spring.datasource.url=jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require",
	"spring.datasource.username=postgres.ozmcuhobsfaevrjgpqgm",
	"spring.datasource.password=Killer@m4943aa"
})
class StudResultApplicationTests {

	@Test
	void contextLoads() {
	}

}
